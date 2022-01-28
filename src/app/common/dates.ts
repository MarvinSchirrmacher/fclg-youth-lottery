export function endOfQuarter(end: Date | undefined): Date {
    var today: Date = new Date();

    if (end && end.getTime() < today.getTime())
        return end;

    var year = today.getFullYear();
    var month = lastMonthOfQuarter(today.getMonth());
    var day = lastDayOf(year, month);

    return new Date(year, month, day);
}

export function lastMonthOfQuarter(month: number) {
    return month - (month % 3) + 2;
}

export function lastDayOf(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}