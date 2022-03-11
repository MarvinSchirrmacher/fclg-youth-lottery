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
  public informed: boolean
  public paid: boolean

  constructor(draw: Draw, user: User, tickets: WinningTicket[], profit: number, id?: BSON.ObjectID) {
    this._id = id
    this.draw = draw
    this.user = user
    this.tickets = tickets
    this.profit = profit
    this.informed = false
    this.paid = false
  }

  public setProfit(value: number): void {
    this.profit = value
  }

  public setInformed(): void {
    this.informed = true
  }

  public setPaid(): void {
    this.paid = true
  }
}