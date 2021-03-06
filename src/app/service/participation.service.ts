import { Injectable } from '@angular/core'
import { QueryRef } from 'apollo-angular'
import { BSON } from 'realm-web'
import { forkJoin, map, Observable, zip } from 'rxjs'
import { endOfQuarter, endOfToday, endOfYear } from '../common/dates'
import { Participation } from '../common/participation'
import { Term } from '../common/term'
import { User } from '../common/user'
import { WinningTicket } from '../common/winning-ticket'
import { toParticipationInstance } from './database-documents'
import { DatabaseService, Done, QueryParticipationsResult, QueryUsersResult } from './database.service'


export enum ParticipationEnd {
  Today,
  EndOfQuarter,
  EndOfYear,
  None
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {

  private _participationsQuery: QueryRef<QueryParticipationsResult> | undefined
  private _usersQuery: QueryRef<QueryUsersResult> | undefined
  private tickets = [] as WinningTicket[]

  get participationsQuery(): QueryRef<QueryParticipationsResult> {
    if (this._participationsQuery == undefined)
      this._participationsQuery = this.database.queryParticipations()
    return this._participationsQuery
  }

  get usersQuery(): QueryRef<QueryUsersResult> {
    if (this._usersQuery == undefined)
      this._usersQuery = this.database.queryUsers()
    return this._usersQuery
  }

  constructor(private database: DatabaseService) {
    this.tickets = this.establishTickets()
  }

  public refetch(): void {
    this._participationsQuery?.refetch()
    this._usersQuery?.refetch()
  }

  public queryParticipations(): Observable<Participation[]> {
    return zip([
      this.participationsQuery.valueChanges,
      this.usersQuery.valueChanges])
      .pipe(map(([ps, us]) =>
        ps.data.participations
        .map(p => {
          let o = us.data.users.find(u => u._id === p.user)
          let u = o ? User.fromObject(o) : User.unknown()
          return toParticipationInstance(p, u)
        })
        .sort((a, b) => a.ticket.compareTo(b.ticket))
      ))
  }

  public queryUsers(): Observable<User[]> {
    return this.usersQuery.valueChanges
      .pipe(map(result => result.data.users))
  }

  public getCurrentUser(id: BSON.ObjectID): User | undefined {
    return this.usersQuery.getCurrentResult().data.users.find(u => u._id === id)
  }

  public getCurrentParticipation(id: BSON.ObjectID): Participation | undefined {
    return this.getCurrentParticipations().find(p => p._id === id)
  }

  public getCurrentParticipations(): Participation[] {
    var participations = this.participationsQuery.getCurrentResult().data.participations
    var users = this.usersQuery.getCurrentResult().data.users
    return participations
      .map(p => ({
        _id: p._id,
        user: users.find(u => u._id === p.user),
        ticket: WinningTicket.fromObject(p.ticket),
        term: Term.fromObject(p.term)
      } as Participation))
  }

  public addParticipation(participation: Participation, done?: Done<BSON.ObjectID>): void {
    var error = this.hasError(participation)
    if (error && done?.error) {
      done.error(error)
      return
    }
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          this.refetch()
          if (done && done.next) done.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public addParticipationWithNewUser(participation: Participation, user: User, done?: Done<BSON.ObjectID>): void {
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          this.refetch()
          this.addUser(user, id, done)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public addUser(user: User, participationId?: BSON.ObjectID, done?: Done<BSON.ObjectID>): void {
    this.database.insertUser(user)
      .subscribe({
        next: result => {
          let userId = result.data!.insertOneUser._id
          this.refetch()
          if (participationId) {
            let update = { user: { _id: userId } } as Partial<Participation>
            this.database.updateParticipation(participationId, update)
              .subscribe({
                next: result => { if (done?.next) done.next(userId) },
                error: error => { if (done?.error) done.error(error) }
              })
          } else {
            if (done?.next) done.next(userId)
          }
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public deleteParticipation(id: BSON.ObjectID, done?: Done<BSON.ObjectID>): void {
    this.database.deleteParticipation(id)
      .subscribe({
        next: result => {
          let id = result.data?.deleteOneParticipation._id
          this.refetch()
          if (done?.next) done.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public deleteParticipations(ids: BSON.ObjectID[], done?: Done<number[]>): void {
    this.database.deleteParticipations(ids)
      .subscribe({
        next: result => {
          let count = result.data?.deleteManyParticipations.deletedCount
          this.refetch()
          if (done?.next) done?.next(count)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public endParticipation(id: BSON.ObjectID, end: ParticipationEnd, done?: Done<BSON.ObjectID>): void {
    var current = this.getCurrentParticipation(id)
    if (current === undefined)
      return

    var update = {
      term: {
        start: current.term.start,
        end: this.calculateEndDate(current, end)
      }
    } as Participation

    this.database.updateParticipation(id, update)
      .subscribe({
        next: result => {
          let id = result.data?.updateOneParticipation._id
          this.refetch()
          if (done?.next) done.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public endParticipations(ids: BSON.ObjectID[], end: ParticipationEnd, done?: Done<number[]>): void {
    var updates = ids
        .map(id => this.getCurrentParticipation(id))
        .filter(participation => participation !== undefined)
        .map(participation => {
          let update = {
            term: {
              start: participation?.term.start,
              end: this.calculateEndDate(participation!, end)
            }
          } as Participation

          return this.database.updateParticipation(participation?._id!, update)
        })

    forkJoin(updates)
      .subscribe({
        next: result => {
          let count = result.length
          this.refetch()
          if (done?.next) done.next([count])
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public updateUser(id: BSON.ObjectID, user: User, done?: Done<BSON.ObjectID>): void {
    this.database.updateUser(id, user)
      .subscribe({
        next: result => {
          let id = result.data?.updateOneUser._id
          this.refetch()
          if (done?.next) done?.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public deleteUser(id: BSON.ObjectID, done?: Done<BSON.ObjectID>): void {
    this.database.deleteUser(id)
      .subscribe({
        next: result => {
          let id = result.data?.deleteOneUser._id
          this.refetch()
          if (done?.next) done?.next(id)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  public deleteUsers(ids: BSON.ObjectID[], done?: Done<number[]>): void {
    this.database.deleteUsers(ids)
      .subscribe({
        next: result => {
          let count = result.data?.deleteManyUsers.deletedCount
          this.refetch()
          if (done?.next) done?.next(count)
        },
        error: error => { if (done?.error) done.error(error) }
      })
  }

  private hasError(participation: Participation): Error | undefined {
    var isLogical = participation.term.end ? participation.term.end.getTime() >= participation.term.start.getTime() : true
    if (!isLogical)
      return new Error(`Das Startdatum liegt nicht vor dem Enddatum`)

    var ticketIsAllocated = this.getCurrentParticipations()
      .find(p => p.ticket.equals(participation.ticket))

    if (!ticketIsAllocated)
      return undefined;

    var overlaps = this.getCurrentParticipations()
      .filter(p => p.ticket.equals(participation.ticket))
      .find(p => this.termsOverlap(participation.term, p.term))

    return overlaps
      ? new Error(`Das Gewinnlos ist im angegebenen Zeitraum bereits (teilweise) vergeben`)
      : undefined
  }

  private termsOverlap(term: Term, otherTerm: Term) {
    let endsBefore = term.end ? term.end.getTime() < otherTerm.start.getTime() : false
    let startsAfter = otherTerm.end ? term.start.getTime() > otherTerm.end.getTime() : false
    return !(endsBefore || startsAfter)
  }

  /* Winning Ticket Service */

  private establishTickets(): WinningTicket[] {
    var numbers = Array.from(Array(49).keys()).map(n => n + 1)
    var lists = Array.from(Array(2).keys()).map(l => l + 1)
    var tickets = lists.map(l => numbers
      .map(n => new WinningTicket(l, n)))

    return tickets.reduce((a, b) => a.concat(b))
  }

  public observeUsedTickets(): Observable<WinningTicket[]> {
    var today = endOfToday()
    return this.participationsQuery.valueChanges
      .pipe(map(result => result.data.participations
        .filter(p => {
          var hasStarted = (new Date(p.term.start)).getTime() <= today.getTime()
          var hasEnded = p.term.end ? (new Date(p.term.end)).getTime() < today.getTime() : false
          return hasStarted && !hasEnded
        })
        .map(p => p.ticket)))
  }

  public observeFreeTickets(): Observable<WinningTicket[]> {
    return this.observeUsedTickets()
      .pipe(
        map(usedTickets => this.tickets
          .filter(t => !usedTickets.find(u => t.equals(u)))))
  }

  private calculateEndDate(participation: Participation, end: ParticipationEnd): Date {
    if (end === ParticipationEnd.Today)
      return endOfToday()
    else if (end === ParticipationEnd.EndOfQuarter)
      return endOfQuarter()
    else if (end === ParticipationEnd.EndOfYear)
      return endOfYear()

    return participation.term.end!
  }
}
