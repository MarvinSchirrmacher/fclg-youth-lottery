import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LotteryDraw } from '../common/lotterydraw';

export enum DrawDay {
  Wednesday = 3,
  Saturday = 6,
  All = 7
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

  public getLatestDraw(day: DrawDay = DrawDay.All): Observable<LotteryDraw> {
    return this.fetchAllDraws(d => true, day)
        .pipe(map((entries: LotteryDraw[]) => entries[entries.length - 1]));
  }

  public getAllDrawsAfter(date: Date, day: DrawDay = DrawDay.All): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getTime() >= date.getTime(), day);
  }

  public getAllDrawsBefore(date: Date, day: DrawDay = DrawDay.All): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getTime() <= date.getTime(), day);
  }

  public getAllDrawsOfYear(year: number, day: DrawDay = DrawDay.All): Observable<LotteryDraw[]> {
    return this.fetchAllDraws(d => d.date.getFullYear() == year, day);
  }

  private fetchAllDraws(
      where: (d: LotteryDraw) => boolean, day: DrawDay): Observable<LotteryDraw[]> {
    return this.http
      .get<Archive>(this.urlAllDraws)
      .pipe(map((archive: Archive) => this.fromArchiveEntry(archive.data)))
      .pipe(map((entries: LotteryDraw[]) =>
        entries.filter(e => where(e) && this.isDay(e, day))
      ));
  }

  private fromArchiveEntry(entries: ArchiveEntry[]): LotteryDraw[] {
    return entries
      .map(e => ({
          id: e.id,
          date: this.dateFromString(e.date),
          numbers: e.Lottozahl
        } as LotteryDraw))
      .sort(this.sortIdDesc);
  }

  private sortIdDesc(d1: LotteryDraw, d2: LotteryDraw): number {
    return d1.id > d2.id ? -1 : 1;
  }

  private sortDateDesc(d1: LotteryDraw, d2: LotteryDraw): number {
    return d1.date.getTime() > d2.date.getTime() ? -1 : 1;
  }

  private isDay(draw: LotteryDraw, day: DrawDay): boolean {
    if (day === DrawDay.All) return true;
    return day === draw.date.getDay();
  }

  private dateFromString(date: string): Date {
    var day = Number(date.substring(0, 2));
    var month = Number(date.substring(3, 5));
    var year = Number(date.substring(6, 10));
    return new Date(year, month - 1, day);
  }
}
