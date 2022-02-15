import { BSON } from "realm-web"
import { dateFromString } from "./dates"

export class LotteryDraw {
    private daysPerWeek: number = 7

    public _id?: BSON.ObjectID
    public date: Date = {} as Date
    public numbers: number[] = []

    constructor(date: string, numbers: number[], id?: BSON.ObjectID) {
        this._id = id
        this.date = dateFromString(date)
        this.numbers = numbers.slice(0, 6)
    }

    get week(): number {
        const firstDayOfYear = new Date(this.date.getFullYear(), 0, 4) // first week includes first thursday
        const pastDaysOfYear = (this.date.getTime() - firstDayOfYear.getTime()) / 86400000
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / this.daysPerWeek)
    }
  }