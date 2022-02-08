import { BSON } from "realm-web";
import { User } from "./data";
import { LotteryDraw } from "./lotterydraw";
import { WinningTicket } from "./winning-ticket";

export class LotteryWinner {
  public _id?: BSON.ObjectID
  public draw: LotteryDraw
  public user: User
  public tickets: WinningTicket[]
  public profit: number
  public informed: boolean
  public paid: boolean

  constructor(draw: LotteryDraw, user: User, tickets: WinningTicket[], profit: number) {
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