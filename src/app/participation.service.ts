import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { BSON } from 'realm-web';

export interface Participation {
  _id?: BSON.ObjectID;
  firstName: string;
  lastName: string;
  number: number;
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  query = {} as QueryRef<Participation>;
  
  constructor(private apollo: Apollo,
              private datePipe: DatePipe) {

    this.query = this.apollo
      .watchQuery<Participation>({
        query: gql`{
          participations {
            _id,
            firstName,
            lastName,
            number,
            start,
            end
          }}`,
        fetchPolicy: 'cache-and-network'
      });
  }

  getFields(): string[] {
    return [
      'firstName',
      'lastName',
      'number',
      'start',
      'end'
    ]
  }

  onChange(next: (value: any) => void): void {
    this.query.valueChanges.subscribe(next);
  }

  addParticipation(participation: Participation) {
    this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        insertOneParticipation(data: {
          firstName: "${participation.firstName}",
          lastName: "${participation.lastName}",
          number: ${participation.number},
          start: "${this.toString(participation.start)}",
          end: "${this.toString(participation.end)}"
        }) { _id } }`
    }).subscribe({
      next: ({data}) => this.query.refetch(),
      error: (error) => console.error(error)
    })
  }

  removeParticipation(id: BSON.ObjectID) {
    this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        deleteOneParticipation(query: {
          _id:"${id}"
        }) { _id } }`
    }).subscribe({
      next: ({data}) => this.query.refetch(),
      error: (error) => console.error(error)
    })
  }

  private toString(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
