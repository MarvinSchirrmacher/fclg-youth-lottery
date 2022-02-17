import { BSON } from "realm-web"

export class LotteryDraw {

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

    public static fromObject(object: LotteryDraw): LotteryDraw {
        return new LotteryDraw(new Date(object.date), object.numbers, object.evaluated, object._id)
    }
}