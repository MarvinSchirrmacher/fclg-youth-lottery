import { BSON } from "realm-web";
import { Participation } from "./data";

export class LotteryWinner {
  public _id?: BSON.ObjectID
  public date: Date
  public participation: Participation
  public informed: boolean
  public paid: boolean

  constructor(date: Date, participation: Participation) {
    this.date = date
    this.participation = participation
    this.informed = false
    this.paid = true
  }

  public setInformed(): void {
    this.informed = true
  }

  public setPaid(): void {
    this.paid = true
  }
}