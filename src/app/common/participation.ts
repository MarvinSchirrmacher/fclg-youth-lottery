import { BSON } from "realm-web"
import { Term } from "./term"
import { User } from "./user"
import { WinningTicket } from "./winning-ticket"


export class Participation {
  _id?: BSON.ObjectID
  user: User
  ticket: WinningTicket
  term: Term

  constructor(user: User, ticket: WinningTicket, term: Term, id?: BSON.ObjectID) {
    this._id = id
    this.user = user
    this.ticket = ticket
    this.term = term
  }

  public static fromObject(participation: Participation): Participation {
    return new Participation(
      User.fromObject(participation.user),
      WinningTicket.fromObject(participation.ticket),
      Term.fromObject(participation.term),
      participation._id)
  }
}