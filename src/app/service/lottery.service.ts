import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, first, forkJoin, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { dateFromString, isDay } from '../common/dates';
import { LotteryDraw } from '../common/lotterydraw';
import { DatabaseService } from './database.service';


export enum DrawDay {
  Wednesday = 3,
  Saturday = 6,
  All = 7
}

interface DatesAndDraws {
  dates: Date[],
  draws: LotteryDraw[]
}

@Injectable({
  providedIn: 'root',
})
export class LotteryService {

  private _archiveUrl: string =
    'https://www.westlotto.com/wlinfo/WL_InfoService?client=wlincl&gruppe=ZahlenUndQuoten&spielart=LOTTO&historie=ja'

  private _yearSelectRegExp = /<select name=\"selJahr\"(.|\s)*?<\/select>/m
  private _yearOptionRegExp = /<option value=\"(?<year>[\d\.]*)\".*?<\/option>/gm

  private _dateSelectRegExp = /<select name=\"selDatum\"(.|\s)*?<\/select>/m
  private _dateOptionRegExp = /<option value=\"(?<date>[\d\.]*)\".*?<\/option>/gm
  
  private _numbersRegExp = /Gezogene Reihenfolge(.|\s)*?<div class=\"right".*?>(?<numbers>(.|\s)*?)<\/div>/m
  private _numberRegExp = /<span class=\"number.*?>(?<number>\d+)<\/span>/gm

  private _year: number = new Date().getFullYear()
  private _day: DrawDay = DrawDay.All

  constructor(
    private http: HttpClient,
    private database: DatabaseService,
    private datePipe: DatePipe) { }

  public year(year: number): LotteryService {
    this._year = year
    return this
  }

  public day(day: DrawDay): LotteryService {
    this._day = day
    return this
  }

  public readYears(): Observable<number[]> {
    return this.http
      .get(this._archiveUrl, { responseType: 'text' })
      .pipe(
        map(html => this.extractYears(html))
      )
  }

  public updateDraws(): Observable<LotteryDraw[]> {
    return this.http
      .get(`${this._archiveUrl}&jahr=${this._year}`, { responseType: 'text' })
      .pipe(  
        map(html => this.extractDates(html, this._day)),
        switchMap(dates => this.readDraws(dates)),
        concatMap(result =>
          forkJoin(result.dates.map(d => this.maySaveDraw(d, result.draws))))
      )
  }

  private readDraws(dates: Date[]): Observable<DatesAndDraws> {
    var firstDate = dates[dates.length - 1]
    var lastDate = dates[0]
    return this.database
      .queryLotteryDraws(firstDate, lastDate).valueChanges
      .pipe(
        first(),
        map(result => ({
          dates: dates,
          draws: result.data.draws.map(d => LotteryDraw.fromObject(d))
        }))
      )
  }

  private maySaveDraw(date: Date, draws: LotteryDraw[]): Observable<LotteryDraw> {
    var savedDraw = draws.find(d => d.date.getTime() == date.getTime())
    if (savedDraw)
      return of(savedDraw)

    console.debug(`backup: ${date.toISOString()}`)
    return this.http
      .get(`${this._archiveUrl}&datum=${this.datePipe.transform(date, 'dd.MM.yyyy')}`, { responseType: 'text' })
      .pipe(
        map(html => this.extractLotteryDraw(html, date)),
        mergeMap(draw => this.saveDraw(draw))
      )
  }

  private saveDraw(draw: LotteryDraw): Observable<LotteryDraw> {
    return this.database
      .insertLotteryDraw(draw)
      .pipe(map(result => {
        draw._id = result.data?.insertOneDraw._id
        return draw
      }))
  }

  private extractYears(html: string): number[] {
    var match = this._yearSelectRegExp.exec(html)
    if (!match) return []

    var yearSelect = match.toString()
    var years = [] as number[]
    while ((match = this._yearOptionRegExp.exec(yearSelect)) !== null)
      years.push(parseInt(match.groups!['year']))
    
    return years
  }

  private extractDates(html: string, day: DrawDay): Date[] {
    var match = this._dateSelectRegExp.exec(html)
    if (!match) return []

    var dateSelect = match.toString()
    var dates = [] as Date[]
    while ((match = this._dateOptionRegExp.exec(dateSelect)) !== null) {
      let date = dateFromString(match.groups!['date'])
      if (isDay(date, day))
        dates.push(date)
    }
    return dates
  }

  private extractLotteryDraw(html: string, date: Date): LotteryDraw {
    var match = this._numbersRegExp.exec(html)
    if (!match || !match.groups)
      return {} as LotteryDraw

    var numbersHtml = match.groups['numbers']
    var numbers = [] as number[]
    while ((match = this._numberRegExp.exec(numbersHtml)) !== null)
      numbers.push(parseInt(match.groups!['number']))

    return new LotteryDraw(date, numbers, false)
  }
}
