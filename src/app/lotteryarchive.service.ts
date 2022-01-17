import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface LotteryDraw {
  date: Date;
  id: number;
  calendarweek: number;
  numbers: number[];
  winningNumber: number;
}

interface ArchiveEntry {
  id: number,
  date: string,
  Lottozahl: number[]
}

interface Archive {
  data: ArchiveEntry[]
}

@Injectable({
  providedIn: 'root',
})
export class LotteryArchiveService {
  private urlAllDraws: string =
    'https://johannesfriedrich.github.io/LottoNumberArchive/Lottonumbers_complete.json';

  constructor(private http: HttpService) {}

  public getLatestDraw(): Observable<LotteryDraw> {
    return this.fetchAllDraws(d => true)
        .pipe(map((entries: LotteryDraw[]) => entries[entries.length - 1]));
  }

  public getAllDrawsAfter(date: Date): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getTime() >= date.getTime());
  }

  public getAllDrawsBefore(date: Date): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getTime() <= date.getTime());
  }

  public getAllDrawsOfYear(year: number): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getFullYear() == year);
  }

  public fetchAllDraws(where: (d: LotteryDraw) => boolean): Observable<LotteryDraw[]> {
    return this.http
      .get<Archive>(this.urlAllDraws)
      .pipe(map((archive: Archive) => this.fromArchiveEntry(archive.data)))
      .pipe(map((entries: LotteryDraw[]) => entries.filter(e => where(e))));
  }

  private fromArchiveEntry(entries: ArchiveEntry[]): LotteryDraw[] {
    return entries
      .map(e => {
        return {
          id: e.id,
          date: this.dateFromString(e.date),
          calendarweek: this.getWeekNumber(e.date),
          numbers: e.Lottozahl,
          winningNumber: e.Lottozahl[0],
        };})
      .sort(this.sortIdDesc);
  }

  private sortIdDesc(d1: LotteryDraw, d2: LotteryDraw): number {
    return d1.id > d2.id ? -1 : 1;
  }

  private sortDateDesc(d1: LotteryDraw, d2: LotteryDraw): number {
    return d1.date.getTime() > d2.date.getTime() ? -1 : 1;
  }

  private dateFromString(date: string): Date {
    var day = Number(date.substring(0, 2));
    var month = Number(date.substring(3, 5));
    var year = Number(date.substring(6, 10));
    return new Date(year, month - 1, day);
  }

  private getWeekNumber(dateString: string): number {
    const date = this.dateFromString(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
