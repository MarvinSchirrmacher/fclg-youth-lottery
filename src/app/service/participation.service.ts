import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { BSON } from 'realm-web';
import { map, Observable } from 'rxjs';
import { Participation } from '../common/data';

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  query = {} as QueryRef<Participation[]>;
  
  constructor(private apollo: Apollo) {

    this.query = this.apollo
      .watchQuery<Participation[]>({
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

  public addParticipation(participation: Participation) {
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
          end: "${participation.end.toISOString()}"
        }) { _id } }`
    }).subscribe({
      next: value => this.query.refetch(),
      error: error => console.error(error)
    })
  }

  public removeParticipation(id: BSON.ObjectID) {
    this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        deleteOneParticipation(query: {
          _id:"${id}"
        }) { _id } }`
    }).subscribe({
      next: value => this.query.refetch(),
      error: error => console.error(error)
    })
  }
}
