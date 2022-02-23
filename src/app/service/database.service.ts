import { Injectable } from "@angular/core";
import { Apollo, QueryRef, gql, MutationResult } from "apollo-angular";
import { BSON } from "realm-web";
import { Observable } from "rxjs";
import { toGraphQL } from "../common/graphql";
import { LotteryDraw } from "../common/lotterydraw";
import { Participation } from "../common/participation";
import { Term } from "../common/term";
import { User } from "../common/user";
import { WinningTicket } from "../common/winning-ticket";


export interface ParticipationDocument {
  _id?: BSON.ObjectID;
  user: BSON.ObjectID;
  ticket: WinningTicket;
  term: Term;
}

export interface QueryParticipationsResult {
  participations: ParticipationDocument[];
}

export interface QueryUsersResult {
  users: User[];
}

export interface QueryLotteryDrawsResult {
  draws: LotteryDraw[];
}

export interface InsertUserResult {
  insertOneUser: { _id: BSON.ObjectID }
}

export interface InsertParticipationResult {
  insertOneParticipation: { _id: BSON.ObjectID }
}

export interface InsertLotteryDrawResult {
  insertOneDraw: { _id: BSON.ObjectID }
}

export interface UpdateParticipationResult {
  updateOneParticipation: { _id: BSON.ObjectID }
}

export interface UpdateUserResult {
  updateOneUser: { _id: BSON.ObjectID }
}

export interface UpdateLotteryDrawResult {
  updateOneDraw: { _id: BSON.ObjectID }
}

export interface DeleteParticipationResult {
  deleteOneParticipation: { _id: BSON.ObjectID }
}

export interface DeleteUserResult {
  deleteOneUser: { _id: BSON.ObjectID }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private apollo: Apollo) { }

  public queryParticipations(): QueryRef<QueryParticipationsResult> {
    console.debug('queryParticipations')
    return this.apollo
      .watchQuery<QueryParticipationsResult>({
        query: gql`{
          participations {
            _id
            user
            ticket {
              list
              number
            }
            term {
              start
              end
            }
          }}`,
        fetchPolicy: 'cache-and-network'
      });
  }

  public queryUsers(): QueryRef<QueryUsersResult> {
    console.debug('queryUsers')
    return this.apollo
      .watchQuery<QueryUsersResult>({
        query: gql`{
          users {
            _id
            gender
            firstName
            lastName
            email
            phone
            address {
              street
              postalCode
              city
            }
            payment {
              distribution
              iban
            }
          }}`,
        fetchPolicy: 'cache-and-network'
      });
  }

  public queryLotteryDraws(from: Date, to: Date): QueryRef<QueryLotteryDrawsResult> {
    console.debug(`queryLotteryDraws(from: ${from.toISOString()}, to: ${to.toISOString()})`)
    var query = `(query: {
      date_gte: "${from.toISOString()}",
      date_lte: "${to.toISOString()}"
    })`
    
    return this.apollo
      .watchQuery<QueryLotteryDrawsResult>({
        query: gql`{
          draws${query} {
            _id
            date
            numbers
            evaluated
          }}`,
        fetchPolicy: 'network-only' // the range may has new draws
      });
  }

  public insertParticipation(participation: Participation):
    Observable<MutationResult<InsertParticipationResult>> {

    console.debug('insertParticipation')
    return this.apollo.mutate<InsertParticipationResult>({
      mutation: gql`mutation {
        insertOneParticipation(data: ${toGraphQL({
        user: participation.user?._id,
        ticket: participation.ticket,
          term: participation.term
      })} ) { _id } }`
    });
  }

  public insertUser(user: User):
    Observable<MutationResult<InsertUserResult>> {

    console.debug('insertUser')
    return this.apollo.mutate<InsertUserResult>({
      mutation: gql`mutation {
        insertOneUser(data: ${toGraphQL(user)}) { _id }
      }`});
  }

  public insertLotteryDraw(draw: LotteryDraw):
    Observable<MutationResult<InsertLotteryDrawResult>> {

    console.debug('insertLotteryDraw')
    return this.apollo.mutate<InsertLotteryDrawResult>({
      mutation: gql`mutation {
        insertOneDraw(data: ${toGraphQL(draw)}) { _id }
      }`});
  }

  public updateParticipation(id: BSON.ObjectID, participation: ParticipationDocument):
    Observable<MutationResult<UpdateParticipationResult>> {

    console.debug('updateParticipation')
    return this.apollo.mutate<UpdateParticipationResult>({
      mutation: gql`mutation {
        updateOneParticipation(
          query: { _id:"${id}" },
          set: ${toGraphQL(participation)}
        ) { _id } }`
    });
  }

  public updateUser(id: BSON.ObjectID, user: User):
    Observable<MutationResult<UpdateUserResult>> {

    console.debug('updateUser')
    return this.apollo.mutate<UpdateUserResult>({
      mutation: gql`mutation {
        updateOneUser(
          query: { _id: "${id}" },
          set: ${toGraphQL(user)}
        ) { _id } }`
    })
  }

  public updateLotteryDraw(id: BSON.ObjectID, draw: LotteryDraw):
    Observable<MutationResult<UpdateLotteryDrawResult>> {

    console.debug('updateLotteryDraw')
    return this.apollo.mutate<UpdateLotteryDrawResult>({
      mutation: gql`mutation {
        updateOneLotteryDraw(
          query: { _id: "${id}" },
          set: ${toGraphQL(draw)}
        ) { _id } }`
    })
  }

  public deleteParticipation(id: BSON.ObjectID):
    Observable<MutationResult<DeleteParticipationResult>> {

    console.debug('delete')
    return this.apollo.mutate<DeleteParticipationResult>({
      mutation: gql`mutation {
        deleteOneParticipation(
          query: { _id:"${id}" }
        ) { _id } }`
    });
  }

  public deleteUser(id: BSON.ObjectID):
    Observable<MutationResult<DeleteUserResult>> {

    console.debug('delete')
    return this.apollo.mutate<DeleteUserResult>({
      mutation: gql`mutation {
        deleteOneUser(
          query: { _id:"${id}" }
        ) { _id } }`
    });
  }
}