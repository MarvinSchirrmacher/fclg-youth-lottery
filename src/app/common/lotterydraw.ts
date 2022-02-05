export class LotteryDraw {
    private daysPerWeek: number = 7;

    public id: number = 0;
    public date: Date = {} as Date;
    public numbers: number[] = [];

    get week(): number {
        const firstDayOfYear = new Date(this.date.getFullYear(), 0, 4); // first week includes first thursday
        const pastDaysOfYear = (this.date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / this.daysPerWeek);
    }
  }