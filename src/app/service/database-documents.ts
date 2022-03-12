import { BSON } from "realm-web"
import { Winner } from "../common/winner"
import { Draw } from "../common/draw"
import { Participation } from "../common/participation"
import { Term } from "../common/term"
import { User } from "../common/user"
import { WinningTicket } from "../common/winning-ticket"

export interface ParticipationDocument {
  _id?: BSON.ObjectID
  user: BSON.ObjectID
  ticket: WinningTicket
  term: Term
}

export interface WinnerDocument {
  _id?: BSON.ObjectID
  draw: BSON.ObjectID
  user: BSON.ObjectID
  tickets: WinningTicket[]
  profit: number
  informedOn: Date | undefined
  paidOn: Date | undefined
}

export function toParticipationDocument(object: Partial<Participation>): ParticipationDocument {
  return {
    user: object.user?._id,
    ticket: object.ticket,
    term: object.term
  } as ParticipationDocument
}

export function toWinnerDocument(object: Partial<Winner>): WinnerDocument {
  return {
    draw: object.draw?._id,
    user: object.user?._id,
    tickets: object.tickets,
    profit: object.profit,
    informedOn: object.informedOn,
    paidOn: object.paidOn
  } as WinnerDocument
}

export function toParticipationInstance(
    document: ParticipationDocument, user?: User): Participation {
  return new Participation(
    user ? User.fromObject(user) : User.unknown(),
    WinningTicket.fromObject(document.ticket),
    Term.fromObject(document.term),
    document._id)
}

export function toWinnerInstance(
    document: WinnerDocument, draw: Draw, user?: User): Winner {    
  return new Winner(
    Draw.fromObject(draw),
    user ? User.fromObject(user) : User.unknown(),
    document.tickets.map(t => WinningTicket.fromObject(t)),
    document.profit,
    document.informedOn,
    document.paidOn,
    document._id)
}