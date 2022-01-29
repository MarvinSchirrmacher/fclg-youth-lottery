import { Injectable } from '@angular/core';
import { ApolloQueryResult, gql } from '@apollo/client/core';
import { Apollo, MutationResult, QueryRef } from 'apollo-angular';
import { BSON } from 'realm-web';
import { map, Observable } from 'rxjs';
import { Participation } from '../common/data';
import { endOfQuarter, endOfToday } from '../common/dates';
import { toGraphQL } from '../common/graphql';
import { WinningTicket } from '../common/winning-ticket';

interface ParticipationResponse {
  participations: Participation[];
}

interface AddParticipationResult {
  insertOneParticipation: {
    _id: BSON.ObjectID
  }
}

export enum ParticipationEnd {
  Today,
  EndOfQuarter,
  None
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  query = {} as QueryRef<ParticipationResponse>;
  allTickets = [] as WinningTicket[];

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

    this.allTickets = this.establishTickets();
  }

  public refetch(): void {
    this.query.refetch();
  }

  public getParticipation(id: BSON.ObjectID): Participation | undefined {
    return this.participations.find(p => p._id === id);
  }

  public observeParticipations(): Observable<Participation[]> {
    return this.query.valueChanges
      .pipe(map(result => result.data.participations as Participation[]));
  }

  public subscribe(next: (result: ApolloQueryResult<ParticipationResponse>) => void): void {
    this.query.valueChanges.subscribe(next);
  }

  public addParticipation(participation: Participation): Observable<MutationResult<AddParticipationResult>> {
    return this.apollo.mutate<AddParticipationResult>({
      mutation: gql`mutation {
        insertOneParticipation(data: ${toGraphQL(participation)} ) { _id } }`
    });
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

  public removeParticipation(id: BSON.ObjectID): Observable<any> {
    return this.apollo.mutate<Participation>({
      mutation: gql`mutation {
        deleteOneParticipation(query: {
            _id:"${id}"
          }
        ) { _id } }`
    });
  }

  public endParticipation(id: BSON.ObjectID, end: ParticipationEnd): void {
    var current = this.getParticipation(id);
    if (current === undefined)
      return;

    var endDate = current.end;
    if (end === ParticipationEnd.Today)
      endDate = endOfToday();
    else if (end === ParticipationEnd.EndOfQuarter)
      endDate = endOfQuarter();

    var update = { end: endDate } as Participation;
    this.updateParticipation(id, update);
  }

  public establishTickets(): WinningTicket[] {
    var numbers = Array.from(Array(49).keys()).map(n => n + 1);
    var lists = Array.from(Array(2).keys()).map(l => l + 1);
    var tickets = lists.map(l => numbers
      .map(n => new WinningTicket(l, n)));

    return tickets.reduce((a, b) => a.concat(b));
  }

  public observeUsedTickets(): Observable<WinningTicket[]> {
    return this.query.valueChanges
      .pipe(map(result => result.data.participations.map(p => p.ticket)));
  }

  public observeFreeTickets(): Observable<WinningTicket[]> {
    return this.observeUsedTickets()
      .pipe(map(usedTickets => this.allTickets
        .filter(t => !usedTickets.find(u => t.equals(u)))));
  }

  get participations(): Participation[] {
    return this.query.getCurrentResult().data.participations;
  }
}
