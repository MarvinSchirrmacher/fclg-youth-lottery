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

export function endOfYear(): Date {
    var today: Date = new Date();

    var year = today.getFullYear();
    var month = 11;
    var day = lastDayOf(year, month);

    return new Date(year, month, day);
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