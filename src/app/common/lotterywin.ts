import { User } from "./data";
import { LotteryDraw } from "./lotterydraw";

export class LotteryWin {
    public draw: LotteryDraw = {} as LotteryDraw;
    public winners: User[] = [];

    get winningNumber(): number {
        return this.draw.numbers[0];
    }
}