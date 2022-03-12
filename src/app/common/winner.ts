import { BSON } from "realm-web";
import { Draw } from "./draw";
import { User } from "./user";
import { WinningTicket } from "./winning-ticket";

export class Winner {
  public _id?: BSON.ObjectID
  public draw: Draw
  public user: User
  public tickets: WinningTicket[]
  public profit: number
  public informedOn: Date | undefined
  public paidOn: Date | undefined

  constructor(
      draw: Draw,
      user: User,
      tickets: WinningTicket[],
      profit: number,
      informedOn?: Date,
      paidOn?: Date,
      id?: BSON.ObjectID) {
    this._id = id
    this.draw = draw
    this.user = user
    this.tickets = tickets
    this.profit = profit
    this.informedOn = informedOn
    this.paidOn = paidOn
  }

  public setProfit(value: number): void {
    this.profit = value
  }
}