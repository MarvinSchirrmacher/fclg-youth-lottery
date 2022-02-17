import { DrawDay } from "../service/lottery.service";

export function endOfToday(): Date {
    var today: Date = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function endOfQuarter(): Date {
    var today: Date = new Date();

    var year = today.getFullYear();
    var month = lastMonthOfQuarter(today.getMonth());
    var day = lastDayOf(year, month);

    return new Date(year, month, day);
}

export function startOfNextQuarter(): Date {
    var today: Date = new Date();

    var year = today.getFullYear();
    var month = firstMonthOfNextQuarter(today.getMonth());
    var day = 1;

    return new Date(year, month, day);
}

export function startOfYear(date?: Date): Date {
    var ref: Date = date ? date : new Date();

    var year = ref.getFullYear();
    var month = 0;
    var day = 1;

    return new Date(year, month, day);
}

export function endOfYear(date?: Date): Date {
    var ref: Date = date ? date : new Date();

    var year = ref.getFullYear();
    var month = 11;
    var day = lastDayOf(year, month);

    return new Date(year, month, day);
}

export function dateFromString(date: string): Date {
    var day = Number(date.substring(0, 2))
    var month = Number(date.substring(3, 5))
    var year = Number(date.substring(6, 10))
    return new Date(year, month - 1, day)
}

export function isDay(date: Date, day: DrawDay): boolean {
  if (day === DrawDay.All) return true
  return day === date.getDay()
}

function lastMonthOfQuarter(month: number) {
    return month - (month % 3) + 2;
}

function firstMonthOfNextQuarter(month: number) {
    return lastMonthOfQuarter(month) + 1;
}

function lastDayOf(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}