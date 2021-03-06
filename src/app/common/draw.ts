import { BSON } from "realm-web"

export class Draw {

  public _id?: BSON.ObjectID
  public date: Date = {} as Date
  public numbers: number[] = []
  public evaluated: boolean = false

  constructor(date: Date, numbers: number[], evaluated: boolean, id?: BSON.ObjectID) {
    this._id = id
    this.date = date
    this.numbers = numbers.slice(0, 6)
    this.evaluated = evaluated
  }

  public reset(): void {
    this.evaluated = false
  }

  public static fromObject(object: Draw): Draw {
    return new Draw(new Date(object.date), object.numbers, object.evaluated, object._id)
  }
}