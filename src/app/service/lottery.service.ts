import { Injectable } from '@angular/core'
import { forkJoin, map, mergeMap, Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { dateFromString, isDay } from '../common/dates';
import { LotteryDraw } from '../common/lotterydraw';


export enum DrawDay {
  Wednesday = 3,
  Saturday = 6,
  All = 7
}

@Injectable({
  providedIn: 'root',
})
export class LotteryService {

  private _westlottoArchiveUrl: string =
    'https://www.westlotto.com/wlinfo/WL_InfoService?client=wlincl&gruppe=ZahlenUndQuoten&spielart=LOTTO&historie=ja'

  private _dateSelectRegExp = /<select name=\"selDatum\"(.|\s)*?<\/select>/m
  private _dateOptionRegExp = /<option value=\"(?<date>[\d\.]*)\".*?<\/option>/m
  private _numbersRegExp = /Gezogene Reihenfolge(.|\s)*?<div class=\"right".*?>(?<numbers>(.|\s)*?)<\/div>/m
  private _numberRegExp = /<span class=\"number.*?>(?<number>\d+)<\/span>/gm

  private _year: number = new Date().getFullYear()
  private _day: DrawDay = DrawDay.All

  constructor(private http: HttpClient) {}

  public year(year: number): LotteryService {
    this._year = year
    return this
  }

  public day(day: DrawDay): LotteryService {
    this._day = day
    return this
  }

  public readDraws(): Observable<LotteryDraw[]> {
    return this.http
      .get(`${this._westlottoArchiveUrl}&jahr=${this._year}`, { responseType: 'text' })
      .pipe(
        map((html: string) => this.extractDates(html, this._day))
      )
      .pipe(
        mergeMap((dates: string[]) => forkJoin(dates.map(d => this.readDraw(d))))
      )
  }

  private readDraw(date: string): Observable<LotteryDraw> {
    return this.http
      .get(`${this._westlottoArchiveUrl}&datum=${date}`, { responseType: 'text' })
      .pipe(
        map((html: string) => this.extractLotteryDraw(html, date))
      )
  }

  private extractDates(html: string, day: DrawDay): string[] {
    var match = this._dateSelectRegExp.exec(html)
    if (!match) return []
    
    return match.toString()
      .split('\n')
      .map(line => {
        let m = this._dateOptionRegExp.exec(line.trim())
        return m && m.groups ? m.groups['date'] : ''
      })
      .filter(date => date != '' && isDay(dateFromString(date), day))
  }

  private extractLotteryDraw(html: string, date: string): LotteryDraw {
    var match = this._numbersRegExp.exec(html)
    if (!match || !match.groups)
      return {} as LotteryDraw
    
    var numbersHtml = match.groups['numbers']
    var numbers = [] as number[]
    while ((match = this._numberRegExp.exec(numbersHtml)) !== null)
      numbers.push(parseInt(match.groups!['number']))

    return new LotteryDraw(date, numbers)
  }
}
