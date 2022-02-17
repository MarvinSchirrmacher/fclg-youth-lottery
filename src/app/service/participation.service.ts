import { Injectable } from '@angular/core'
import { QueryRef } from 'apollo-angular'
import { BSON } from 'realm-web'
import { map, Observable, zip } from 'rxjs'
import { Participation } from '../common/data'
import { endOfQuarter, endOfToday, endOfYear } from '../common/dates'
import { Term } from '../common/term'
import { User } from '../common/user'
import { WinningTicket } from '../common/winning-ticket'
import { DatabaseService, ParticipationDocument, QueryParticipationsResult, QueryUsersResult } from './database.service'


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
  participationsQuery = {} as QueryRef<QueryParticipationsResult>
  usersQuery = {} as QueryRef<QueryUsersResult>
  allTickets = [] as WinningTicket[]

  constructor(private database: DatabaseService) {
    this.participationsQuery = this.database.queryParticipations()
    this.usersQuery = this.database.queryUsers()
    this.allTickets = this.establishTickets()
  }

  public refetch(): void {
    this.participationsQuery.refetch()
    this.usersQuery.refetch()
  }

  public observeParticipations(): Observable<Participation[]> {
    console.debug('observeParticipations')
    return zip([
      this.participationsQuery.valueChanges,
      this.usersQuery.valueChanges])
      .pipe(map(([ps, us]) =>
        ps.data.participations
        .map(p => ({
          _id: p._id,
          user: new User(us.data.users.find(u => u._id === p.user)!),
          ticket: WinningTicket.fromObject(p.ticket),
          term: Term.fromObject(p.term)
        } as Participation))
        .sort((a, b) => a.ticket.compareTo(b.ticket))
      ))
  }

  public observeUsers(): Observable<User[]> {
    console.debug('observeUsers')
    return this.usersQuery.valueChanges
      .pipe(map(result => result.data.users))
  }

  public getCurrentUser(id: BSON.ObjectID): User | undefined {
    console.debug('getCurrentUser')
    return this.usersQuery.getCurrentResult().data.users.find(u => u._id === id)
  }

  public getCurrentParticipation(id: BSON.ObjectID): Participation | undefined {
    console.debug('getCurrentParticipation')
    return this.getCurrentParticipations().find(p => p._id === id)
  }

  public getCurrentParticipations(): Participation[] {
    console.debug('getCurrentParticipations')
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

  public addParticipation(
    participation: Participation,
    onAdded?: <E extends Error> (addedId?: BSON.ObjectID, error?: E) => void): void {

    console.debug('addParticipation')
    var error = this.hasError(participation)
    if (error) {
      if (onAdded) onAdded(undefined, error)
      return
    }
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          this.refetch()
          if (onAdded) onAdded(id)
        },
        error: error => { if (onAdded) onAdded(undefined, error) }
      })
  }

  public addParticipationWithNewUser(
    participation: Participation, user: User,
    onAdded?: <E extends Error> (addedId?: BSON.ObjectID, error?: E) => void): void {

    console.debug('addParticipationWithNewUser')
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          this.refetch()
          this.addUser(user, id, onAdded)
        },
        error: error => { if (onAdded) onAdded(undefined, error) }
      })
  }

  public addUser(
    user: User, participationId?: BSON.ObjectID,
    onAdded?: <E extends Error> (id?: BSON.ObjectID, error?: E) => void): void {

    console.debug('addUser')
    this.database.insertUser(user)
      .subscribe({
        next: result => {
          let userId = result.data!.insertOneUser._id
          this.refetch()
          if (participationId) {
            let update = { user: userId } as ParticipationDocument
            this.database.updateParticipation(participationId, update)
              .subscribe({
                next: result => { if (onAdded) onAdded(userId) },
                error: error => { if (onAdded) onAdded(undefined, error) }
              })
          } else {
            if (onAdded) onAdded(userId)
          }
        },
        error: error => console.error(error)
      })
  }

  public deleteParticipation(
    id: BSON.ObjectID,
    onDeleted?: <E extends Error> (id?: BSON.ObjectID, error?: E) => void): void {

    console.debug('deleteParticipation')
    this.database.delete(id)
      .subscribe({
        next: result => {
          let id = result.data?.deleteOneParticipation._id
          this.refetch()
          if (onDeleted) onDeleted(id)
        },
        error: error => { if (onDeleted) onDeleted(undefined, error) }
      })
  }

  public endParticipation(
    id: BSON.ObjectID, end: ParticipationEnd,
    onEnded?: <E extends Error> (id?: BSON.ObjectID, error?: E) => void): void {

    console.debug('endParticipation')
    var current = this.getCurrentParticipation(id)
    if (current === undefined)
      return

    var update = {
      term: {
        start: current.term.start,
        end: this.calculateEndDate(current, end)
      }
    } as ParticipationDocument

    this.database.updateParticipation(id, update)
      .subscribe({
        next: result => {
          let id = result.data?.updateOneParticipation._id
          this.refetch()
          if (onEnded) onEnded(id)
        },
        error: error => { if (onEnded) onEnded(undefined, error) }
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

  public establishTickets(): WinningTicket[] {
    console.debug('establishTickets')
    var numbers = Array.from(Array(49).keys()).map(n => n + 1)
    var lists = Array.from(Array(2).keys()).map(l => l + 1)
    var tickets = lists.map(l => numbers
      .map(n => new WinningTicket(l, n)))

    return tickets.reduce((a, b) => a.concat(b))
  }

  public observeUsedTickets(): Observable<WinningTicket[]> {
    console.debug('observeUsedTickets')
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
    console.debug('observeFreeTickets')
    return this.observeUsedTickets()
      .pipe(map(usedTickets => this.allTickets
        .filter(t => !usedTickets.find(u => t.equals(u)))))
  }

  private calculateEndDate(participation: Participation, end: ParticipationEnd): Date {
    console.debug('calculateEndDate')
    if (end === ParticipationEnd.Today)
      return endOfToday()
    else if (end === ParticipationEnd.EndOfQuarter)
      return endOfQuarter()
    else if (end === ParticipationEnd.EndOfYear)
      return endOfYear()

    return participation.term.end!
  }
}
