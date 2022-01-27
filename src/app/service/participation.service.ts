import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { BSON } from 'realm-web';
import { map, Observable } from 'rxjs';
import { Participation } from '../common/data';

interface ParticipationResponse {
  participations: Participation[];
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  query = {} as QueryRef<ParticipationResponse>;
  
  constructor(private apollo: Apollo) {

    this.query = this.apollo
      .watchQuery<ParticipationResponse>({
        query: gql`{
          participations {
            _id
            user {
              firstName
              lastName
            }
            ticket {
              list
              number
            }
            start
            end
          }}`,
        fetchPolicy: 'cache-and-network'
      });
  }

  public getAllParticipations(): Observable<Participation[]> {
    return this.query.valueChanges
        .pipe(map((value: any) => value.data.participations as Participation[]));
  }

  public subscribe(next: (value: any) => void): void {
    this.query.valueChanges.subscribe(next);
  }

  public addParticipation(participation: Participation): void {
    this.apollo.mutate<any>({
      mutation: gql`mutation {
        insertOneParticipation(data: {
            user: {
              firstName: "${participation.user.firstName}"
              lastName: "${participation.user.lastName}"
              email: "${participation.user.email}"
              payment: {
                mode: "${participation.user.payment.mode}"
                iban: "${participation.user.payment.iban}"
              }
            }
            ticket: {
              list: ${participation.ticket.list}
              number: ${participation.ticket.number}
            }
            start: "${participation.start.toISOString()}"
            ${participation.end ? 'end: "' + participation.end.toISOString() + '"' : ''}
          }
        ) { _id } }`
    }).subscribe({
      next: value => this.query.refetch(),
      error: error => console.error(error)
    })
  }

  public updateParticipation(id: BSON.ObjectID, participation: Participation): void {
    this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        updateOneParticipation(query: {
            _id:"${id}"
          },
          set: {
            end: "${participation.end?.toISOString()}"
          }
        ) { _id } }`
    }).subscribe({
      next: value => this.query.refetch(),
      error: error => console.error(error)
    })
  } 

  public removeParticipation(id: BSON.ObjectID): void {
    this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        deleteOneParticipation(query: {
            _id:"${id}"
          }
        ) { _id } }`
    }).subscribe({
      next: value => this.query.refetch(),
      error: error => console.error(error)
    })
  }

  public endParticipation(id: BSON.ObjectID): void {
    var current = this.query.getCurrentResult().data.participations.find(p => p._id === id);
    if (current === undefined)
      return;
    
    var updated = {
      end: this.endOfQuarter(current.end ? new Date(current.end) : undefined)
    } as Participation;
    this.updateParticipation(id, updated);
  }

  private endOfQuarter(end: Date | undefined): Date {
    var today: Date = new Date();

    if (end && end.getTime() < today.getTime())
      return end;

    var year = today.getFullYear();
    var month = this.lastMonthOfQuarter(today.getMonth());
    var day = this.lastDayOf(year, month);

    return new Date(year, month, day);
  }

  private lastMonthOfQuarter(month: number) {
    return month - (month % 3) + 2;
  }

  private lastDayOf(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}
