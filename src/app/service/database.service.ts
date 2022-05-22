import { Injectable } from "@angular/core"
import { Apollo, QueryRef, gql, MutationResult } from "apollo-angular"
import { BSON } from "realm-web"
import { Observable, of } from "rxjs"
import { Winner } from "../common/winner"
import { Draw } from "../common/draw"
import { Participation } from "../common/participation"
import { User } from "../common/user"
import { ParticipationDocument, toParticipationDocument, toWinnerDocument, WinnerDocument } from "./database-documents"
import { toGraphQL } from "../common/graphql"


export interface Done<NextParameter> {
  next?: (parameter?: NextParameter) => void,
  error?: <E extends Error> (error?: E) => void
}

export interface QueryParticipationsResult {
  participations: ParticipationDocument[]
}

export interface QueryUsersResult {
  users: User[]
}

export interface QueryDrawsResult {
  draws: Draw[]
}

export interface QueryWinnersResult {
  winners: WinnerDocument[]
}

export interface QueryYearsResult {
  draws: Partial<Draw>[]
}

interface IdPayload {
  _id: BSON.ObjectID
}

export interface InsertUserResult {
  insertOneUser: IdPayload
}

export interface InsertParticipationResult {
  insertOneParticipation: IdPayload
}

export interface InsertDrawResult {
  insertOneDraw: IdPayload
}

export interface InsertWinnersResult {
  insertManyWinners: { insertedIds: BSON.ObjectID[] }
}

export interface UpdateParticipationResult {
  updateOneParticipation: IdPayload
}

export interface UpdateUserResult {
  updateOneUser: IdPayload
}

export interface UpdateDrawResult {
  updateOneDraw: IdPayload
}

export interface UpdateWinnerResult {
  updateOneWinner: IdPayload
}

export interface UpdateManyPayload {
  matchedCount: number
  modifiedCount: number
}

export interface DeleteParticipationResult {
  deleteOneParticipation: IdPayload
}

export interface DeleteUserResult {
  deleteOneUser: IdPayload
}

export interface DeleteWinnerResult {
  deleteOneWinner: IdPayload
}

interface DeleteManyPayload {
  deletedCount: number[]
}

export interface DeleteParticipationsResult {
  deleteManyParticipations: DeleteManyPayload
}

export interface DeleteUsersResult {
  deleteManyUsers: DeleteManyPayload
}

export interface DeleteWinnersResult {
  deleteManyWinners: DeleteManyPayload
}


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private emptyFieldsToInclude: string[] = []

  constructor(private apollo: Apollo) { }

  public includeEmpty(fields: string[]): DatabaseService {
    this.emptyFieldsToInclude = fields
    return this
  }

  public queryParticipations(): QueryRef<QueryParticipationsResult> {
    var sortBy = createSortBy('user', SortOrder.Ascending)
    return this.query<QueryParticipationsResult>('participations', undefined, sortBy, `{
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
    }`)
  }

  public queryUsers(ids?: BSON.ObjectID[]): QueryRef<QueryUsersResult> {
    var query = ids ? createIdInQuery('_id', ids) : undefined
    var sortBy = createSortBy('lastname', SortOrder.Ascending)
    return this.query<QueryUsersResult>('users', query, sortBy, `{
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
    }`)
  }

  public queryDraws(from: Date, to: Date): QueryRef<QueryDrawsResult> {
    var query = createDateRangeQuery(from, to)
    var sortBy = createSortBy('date', SortOrder.Descending)
    return this.query<QueryDrawsResult>('draws', query, sortBy, `{
      _id
      date
      numbers
      evaluated
    }`)
  }

  public queryWinners(drawIds: BSON.ObjectID[]): QueryRef<QueryWinnersResult> {
    var query = createIdInQuery('draw', drawIds)
    var sortBy = createSortBy('_id', SortOrder.Descending)
    return this.query<QueryWinnersResult>('winners', query, sortBy, `{
      _id
      draw
      user
      tickets {
        list
        number
      }
      profit
      informedOn
      paidOn
    }`)
  }

  public queryYears(): QueryRef<QueryYearsResult> {
    var sortBy = createSortBy('_id', SortOrder.Descending)
    return this.query<QueryYearsResult>('draws', undefined, sortBy, `{
      date
    }`)
  }

  public insertParticipation(participation: Participation): Observable<MutationResult<InsertParticipationResult>> {
    var document = toParticipationDocument(participation)
    return this.insert<InsertParticipationResult>('insertOneParticipation', document)
  }

  public insertUser(user: User): Observable<MutationResult<InsertUserResult>> {
    return this.insert<InsertUserResult>('insertOneUser', user)
  }

  public insertDraw(draw: Draw): Observable<MutationResult<InsertDrawResult>> {
    return this.insert<InsertDrawResult>('insertOneDraw', draw)
  }

  public insertWinners(winners: Winner[]):
    Observable<MutationResult<InsertWinnersResult>> {

    if (winners.length == 0)
      return ofEmptyResult()

    var documents = winners.map(w => toWinnerDocument(w))
    return this.apollo.mutate<InsertWinnersResult>({
      mutation: gql`mutation {
        insertManyWinners(data: ${this.toGraphQL(documents, new Map([['profit', '%s']]))}) { insertedIds }
      }`})
  }

  public updateParticipation(id: BSON.ObjectID, participation: Partial<Participation>):
      Observable<MutationResult<UpdateParticipationResult>> {
    var document = toParticipationDocument(participation)
    return this.update<UpdateParticipationResult>('updateOneParticipation', id, document)
  }

  public updateUser(id: BSON.ObjectID, user: Partial<User>): Observable<MutationResult<UpdateUserResult>> {
    return this.update<UpdateUserResult>('updateOneUser', id, user)
  }

  public updateDraw(id: BSON.ObjectID, draw: Partial<Draw>): Observable<MutationResult<UpdateDrawResult>> {
    return this.update<UpdateDrawResult>('updateOneDraw', id, draw)
  }

  public updateWinner(id: BSON.ObjectID, winner: Partial<Winner>): Observable<MutationResult<UpdateWinnerResult>> {
    var document = toWinnerDocument(winner)
    return this.update<UpdateWinnerResult>('updateOneWinner', id, document)
  }

  public updateWinnerDocument(id: BSON.ObjectID, document: Partial<Document>): Observable<MutationResult<UpdateWinnerResult>> {
    return this.update<UpdateWinnerResult>('updateOneWinner', id, document)
  }

  public updateDraws(ids: BSON.ObjectID[], draw: Partial<Draw>):
      Observable<MutationResult<UpdateManyPayload>> {

    if (ids.length == 0)
      return ofEmptyResult()

    var query = createIdInQuery('_id', ids)
    return this.apollo.mutate<UpdateManyPayload>({
      mutation: gql`mutation {
        updateManyDraws(
          query: ${query},
          set: ${this.toGraphQL(draw)}
        ) {
          matchedCount
          modifiedCount
        }
      }`
    })
  }

  public deleteParticipation(id: BSON.ObjectID): Observable<MutationResult<DeleteParticipationResult>> {
    return this.delete<DeleteParticipationResult>('deleteOneParticipation', id)
  }

  public deleteUser(id: BSON.ObjectID): Observable<MutationResult<DeleteUserResult>> {
    return this.delete<DeleteUserResult>('deleteOneUser', id)
  }

  public deleteWinner(id: BSON.ObjectID): Observable<MutationResult<DeleteWinnerResult>> {
    return this.delete<DeleteWinnerResult>('deleteOneWinner', id)
  }

  public deleteParticipations(ids: BSON.ObjectID[]): Observable<MutationResult<DeleteParticipationsResult>> {
    return this.deleteMany<DeleteParticipationsResult>('deleteManyParticipations', ids)
  }

  public deleteUsers(ids: BSON.ObjectID[]): Observable<MutationResult<DeleteUsersResult>> {
    return this.deleteMany<DeleteUsersResult>('deleteManyUsers', ids)
  }

  public deleteWinners(ids: BSON.ObjectID[]): Observable<MutationResult<DeleteWinnersResult>> {
    return this.deleteMany<DeleteWinnersResult>('deleteManyWinners', ids)
  }

  public query<ResultType>(
    collection: string, query: string | undefined, sortBy: string | undefined, fields: string):
      QueryRef<ResultType> {
    
    if (query == undefined) query = '{}'
    if (sortBy == undefined) sortBy = '_ID_ASC'

    return this.apollo
      .watchQuery<ResultType>({
        query: gql`{ ${collection}(query: ${query}, sortBy: ${sortBy}) ${fields} }`,
        fetchPolicy: 'network-only' // any range may has new documents
      })
  }

  public insert<ResultType>(mutation: string, document: any):
      Observable<MutationResult<ResultType>> {
    return this.apollo.mutate<ResultType>({
      mutation: gql`mutation {
        ${mutation}(data: ${this.toGraphQL(document)}) { _id }
      }`
    })
  }

  private update<ResultType>(mutation: string, id: BSON.ObjectID, document: any):
      Observable<MutationResult<ResultType>> {
    return this.apollo.mutate<ResultType>({
      mutation: gql`mutation {
        ${mutation}(
          query: { _id: "${id}" },
          set: ${this.toGraphQL(document)}
        ) { _id } }`
    })
  }

  private delete<ResultType>(mutation: string, id: BSON.ObjectID):
    Observable<MutationResult<ResultType>> {
    return this.apollo.mutate<ResultType>({
      mutation: gql`mutation {
        ${mutation}(
          query: { _id:"${id}" }
        ) { _id } }`
    })
  }

  private deleteMany<ResultType>(mutation: string, ids: BSON.ObjectID[]):
    Observable<MutationResult<ResultType>> {
      return this.apollo.mutate<ResultType>({
        mutation: gql`mutation {
          ${mutation}(
            query: { _id_in:${JSON.stringify(ids)} }
          ) { deletedCount } }`
      })
  }

  private toGraphQL(object: any, formats?: Map<string, any>): string {
    if (!formats)
      formats = new Map()
    
    if (this.emptyFieldsToInclude.length > 0)
      this.emptyFieldsToInclude.forEach(f => formats?.set(f, ''))

    var document = toGraphQL(object, formats)
    this.emptyFieldsToInclude = []
    return document
  }
}

function ofEmptyResult(): Observable<MutationResult<any>> {
  return of({
    loading: false
  } as MutationResult)
}

function createDateRangeQuery(from: Date, to: Date): string {
  return `{
    date_gte: "${from.toISOString()}",
    date_lte: "${to.toISOString()}"
  }`
}

function createIdInQuery(key: string, ids: BSON.ObjectID[]): string {
  return `{
    ${key}_in: ${toGraphQL(ids)}
  }`
}

enum SortOrder {
  Ascending = 'ASC',
  Descending = 'DESC'
}

function createSortBy(field: string, order: SortOrder): string {
  return `${field.toUpperCase()}_${order}`
}