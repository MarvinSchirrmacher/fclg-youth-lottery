import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { BSON } from 'realm-web';
import { map, Observable, zip } from 'rxjs';
import { Participation, User } from '../common/data';
import { endOfQuarter, endOfToday } from '../common/dates';
import { WinningTicket } from '../common/winning-ticket';
import { DatabaseService, ParticipationDocument, QueryParticipationsResult, QueryUsersResult } from './database.service';


export enum ParticipationEnd {
  Today,
  EndOfQuarter,
  None
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  participationsQuery = {} as QueryRef<QueryParticipationsResult>;
  usersQuery = {} as QueryRef<QueryUsersResult>;
  allTickets = [] as WinningTicket[];

  constructor(private database: DatabaseService) {
    this.participationsQuery = this.database.queryParticipations();
    this.usersQuery = this.database.queryUsers();
    this.allTickets = this.establishTickets();
  }

  public refetch(): void {
    this.participationsQuery.refetch();
    this.usersQuery.refetch();
  }

  public observeParticipations(): Observable<Participation[]> {
    console.debug('observeParticipations')
    return zip([
      this.participationsQuery.valueChanges,
      this.usersQuery.valueChanges])
      .pipe(map(([ps, us]) => {
        let merged = ps.data.participations.map(p => ({
          _id: p._id,
          user: us.data.users.find(u => u._id === p.user),
          ticket: p.ticket,
          start: p.start,
          end: p.end
        } as Participation));
        console.debug(JSON.stringify(merged));
        return merged;
      }));
  }

  public getCurrentUser(id: BSON.ObjectID): User | undefined {
    console.debug('getCurrentUser')
    return this.usersQuery.getCurrentResult().data.users.find(u => u._id === id);
  }

  public getCurrentParticipation(id: BSON.ObjectID): Participation | undefined {
    console.debug('getCurrentParticipation')
    return this.getCurrentParticipations().find(p => p._id === id);
  }

  public getCurrentParticipations(): Participation[] {
    console.debug('getCurrentParticipations')
    var participations = this.participationsQuery.getCurrentResult().data.participations;
    var users = this.usersQuery.getCurrentResult().data.users;
    return participations
      .map(p => ({
        _id: p._id,
        user: users.find(u => u._id === p.user),
        ticket: p.ticket,
        start: p.start,
        end: p.end
      } as Participation))
  }

  public addParticipation(
    participation: Participation,
    onAdded?: (addedId?: BSON.ObjectID, error?: any) => void): void {

    console.debug('addParticipation')
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          if (onAdded) onAdded(id)
        },
        error: error => { if (onAdded) onAdded(undefined, error) }
      });
  }

  public addParticipationWithNewUser(
    participation: Participation, user: User,
    onAdded?: (addedId?: BSON.ObjectID, error?: any) => void): void {

    console.debug('addParticipationWithNewUser')
    this.database.insertParticipation(participation)
      .subscribe({
        next: result => {
          let id = result.data?.insertOneParticipation._id
          this.addUser(user, id, onAdded)
        },
        error: error => { if (onAdded) onAdded(undefined, error) }
      })
  }

  public addUser(
    user: User, participationId?: BSON.ObjectID,
    onAdded?: (id?: BSON.ObjectID, error?: any) => void): void {

    console.debug('addUser')
    this.database.insertUser(user)
      .subscribe({
        next: result => {
          let userId = result.data!.insertOneUser._id
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
    onDeleted?: (id?: BSON.ObjectID, error?: any) => void): void {

    console.debug('deleteParticipation')
    this.database.delete(id)
      .subscribe({
        next: result => {
          let id = result.data?.deleteOneParticipation._id
          if (onDeleted) onDeleted(id)
        },
        error: error => { if (onDeleted) onDeleted(undefined, error) }
      })
  }

  public endParticipation(
    id: BSON.ObjectID, end: ParticipationEnd,
    onEnded?: (id?: BSON.ObjectID, error?: any) => void): void {

    console.debug('endParticipation')
    var current = this.getCurrentParticipation(id);
    if (current === undefined)
      return;

    var update = {
      end: this.calculateEndDate(current, end)
    } as ParticipationDocument;

    this.database.updateParticipation(id, update)
      .subscribe({
        next: result => {
          let id = result.data?.updateOneParticipation._id;
          if (onEnded) onEnded(id)
        },
        error: error => { if (onEnded) onEnded(undefined, error) }
      });
  }

  /* Winning Ticket Service */

  public establishTickets(): WinningTicket[] {
    console.debug('establishTickets')
    var numbers = Array.from(Array(49).keys()).map(n => n + 1);
    var lists = Array.from(Array(2).keys()).map(l => l + 1);
    var tickets = lists.map(l => numbers
      .map(n => new WinningTicket(l, n)));

    return tickets.reduce((a, b) => a.concat(b));
  }

  public observeUsedTickets(): Observable<WinningTicket[]> {
    console.debug('observeUsedTickets')
    var today = endOfToday();
    return this.participationsQuery.valueChanges
      .pipe(map(result => result.data.participations
        .filter(p => {
          var hasStarted = (new Date(p.start)).getTime() <= today.getTime();
          var hasEnded = p.end ? (new Date(p.end)).getTime() < today.getTime() : false;
          return hasStarted && !hasEnded;
        })
        .map(p => p.ticket)));
  }

  public observeFreeTickets(): Observable<WinningTicket[]> {
    console.debug('observeFreeTickets')
    return this.observeUsedTickets()
      .pipe(map(usedTickets => this.allTickets
        .filter(t => !usedTickets.find(u => t.equals(u)))));
  }

  private calculateEndDate(participation: Participation, end: ParticipationEnd): Date {
    console.debug('calculateEndDate')
    if (end === ParticipationEnd.Today)
      return endOfToday();
    else if (end === ParticipationEnd.EndOfQuarter)
      return endOfQuarter();

    return participation.end!;
  }
}
