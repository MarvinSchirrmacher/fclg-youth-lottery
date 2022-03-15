import { Injectable } from '@angular/core'
import { BSON } from 'realm-web'
import { exhaustMap, first, map, Observable, switchMap } from 'rxjs'
import { Winner as Winner } from '../common/winner'
import { Draw } from '../common/draw'
import { Participation } from '../common/participation'
import { toWinnerInstance, WinnerDocument } from './database-documents'
import { DatabaseService, Done, QueryWinnersResult } from './database.service'
import { ParticipationService } from './participation.service'
import { addUniqueOnly } from '../common/data'
import { QueryRef } from 'apollo-angular'

export interface DrawsAndWinners {
  draws: Draw[]
  winners: Winner[]
}

@Injectable({
  providedIn: 'root'
})
export class LotteryWinService {

  public _profitPerWin: number
  private _winnersQuery: QueryRef<QueryWinnersResult> | undefined

  constructor(
      private participation: ParticipationService,
      private database: DatabaseService) {
    this._profitPerWin = 13.0
  }

  public profitPerWin(value: number): LotteryWinService {
    this._profitPerWin = value
    return this
  }

  public updateWinners(draws: Draw[], force: boolean = false): Observable<Draw[]> {
    var newDraws = force ? draws : draws.filter(d => !d.evaluated)
    var newDrawsIds = newDraws.map(d => d._id!)
    console.debug(`updateWinners ${JSON.stringify(newDraws)}`)
    return this.participation.queryParticipations()
      .pipe(
        map(participations => this.determineWinners(newDraws, participations)),
        exhaustMap(newWinners => this.database.insertWinners(newWinners)),
        exhaustMap(result => this.database.updateDraws(newDrawsIds, { evaluated: true })),
        map(result => draws)
      )
  }

  public queryWinners(draws: Draw[]): Observable<Winner[]> {
    var drawIds = draws.map(d => d._id!)
    console.debug(`draw ids ${JSON.stringify(drawIds)}`)
    this._winnersQuery = this.database.queryWinners(drawIds) 
    return this._winnersQuery.valueChanges
      .pipe(switchMap(result => this.substituteReferences(result.data.winners, draws)))
  }

  public refetchWinners(): void {
    this._winnersQuery?.refetch()
  }

  private determineWinners(draws: Draw[], participations: Participation[]): Winner[] {
    if (draws.length == 0) return []

    return draws
      .map(draw => this.determineWinnersForDraw(draw, participations))
      .reduce((winners, winnersForDraw) => winners.concat(winnersForDraw))
      .reduce((winners, winner) => this.mergeSameWinners(winners, winner), [] as Winner[])
  }

  private determineWinnersForDraw(draw: Draw, participations: Participation[]): Winner[] {
    return participations
        .filter(p => this.isInParticipationTerm(p, draw))
        .filter(p => p.ticket.number === draw.numbers[0])
        .map(p => new Winner(draw, p.user, [p.ticket], this._profitPerWin))
  }

  private mergeSameWinners(winners: Winner[], winner: Winner): Winner[] {
    let sameWinner = winners.find(w => w.user._id == winner.user._id)
    if (sameWinner) {
      sameWinner.tickets = sameWinner.tickets.concat(winner.tickets)
      sameWinner.profit += this._profitPerWin
    } else {
      winners.push(winner)
    }
    return winners
  }

  private substituteReferences(winners: WinnerDocument[], draws: Draw[]): Observable<Winner[]> {
    let userIds = winners
      .map(d => d.user)
      .reduce(addUniqueOnly, [] as BSON.ObjectID[])
    console.debug(`substituteReferences ${JSON.stringify(userIds)}`)
    return this.database.queryUsers(userIds).valueChanges
      .pipe(
        first(),
        map(result => winners.map(w => {
          let draw = draws.find(d => d._id == w.draw)
          let user = result.data.users.find(u => u._id == w.user)
          return toWinnerInstance(w, draw!, user)
        }))
      )
  }

  public saveWinnerInformedOn(id: BSON.ObjectID, date: Date) {
    return this.database.updateWinner(id, { informedOn: date })
  }

  public saveWinnerPaidOn(id: BSON.ObjectID, date: Date) {
    return this.database.updateWinner(id, { paidOn: date })
  }

  public resetWinner(id: BSON.ObjectID) {
    return this.database
      .includeEmpty(['informedOn', 'paidOn'])
      .updateWinner(id, { informedOn: undefined, paidOn: undefined })
  }

  public deleteWinner(id: BSON.ObjectID, done?: Done) {
    console.debug('deleteWinner')
    this.database.deleteWinner(id)
      .subscribe({
        next: result => {
          let id = result.data?.deleteOneWinner._id
          if (done?.next) done?.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  private isInParticipationTerm(p: Participation, d: Draw): boolean {
    var start = new Date(p.term.start)
    var end = p.term.end ? new Date(p.term.end) : undefined
    var draw = new Date(d.date)

    var afterStart = start.getTime() <= draw.getTime()
    var beforeEnd = end ? end.getTime() >= draw.getTime() : true

    return afterStart && beforeEnd
  }
}
