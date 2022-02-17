import { Injectable } from '@angular/core'
import { BSON } from 'realm-web'
import { map, Observable, zip } from 'rxjs'
import { Participation } from '../common/data'
import { LotteryWinner } from '../common/lottery-winner'
import { LotteryDraw } from '../common/lotterydraw'
import { DrawDay, LotteryService } from './lottery.service'
import { ParticipationService } from './participation.service'

@Injectable({
  providedIn: 'root'
})
export class LotteryWinService {

  public _profitPerWin: number

  constructor(
      private lottery: LotteryService,
      private participation: ParticipationService) {
    this._profitPerWin = 13
  }

  private profitPerWin(value: number): LotteryWinService {
    this._profitPerWin = value
    return this
  }

  public observeWinners(): Observable<LotteryWinner[]> {
    var allDraws = this.lottery
      .year(new Date().getFullYear())
      .day(DrawDay.Saturday)
      .updateDraws()
    var allParticipations = this.participation.observeParticipations()

    return zip(allDraws, allParticipations)
      .pipe(map(([draws, participations]) =>
        draws
          .map(d => this.determineWinners(d, participations))
          .reduce((a, b) => a.concat(b))
        ))
  }

  private determineWinners(draw: LotteryDraw, participations: Participation[]): LotteryWinner[] {
    return participations
      .filter(p => this.isInParticipationTerm(p, draw))
      .filter(p => p.ticket.number === draw.numbers[0])
      .map(p => new LotteryWinner(draw, p.user, [p.ticket], this._profitPerWin))
      // .reduce((map, winner) => {
      //   const id = winner.user._id
      //   map[id] = map[id] ?? []
      //   map[id].push(winner)
      //   return map
      // }, {} as Map<BSON.ObjectID, LotteryWinner>)
      
  }

  public setWinnerInformed(id: BSON.ObjectID): void {
    
  }

  public setWinnerPaid(id: BSON.ObjectID): void {
    
  }

  private isInParticipationTerm(p: Participation, d: LotteryDraw): boolean {
    var start = new Date(p.term.start)
    var end = p.term.end ? new Date(p.term.end) : undefined
    var draw = new Date(d.date)

    var afterStart = start.getTime() <= draw.getTime()
    var beforeEnd = end ? end.getTime() >= draw.getTime() : true

    return afterStart && beforeEnd
  }
}
