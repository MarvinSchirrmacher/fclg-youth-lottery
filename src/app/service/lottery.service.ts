import { Injectable } from '@angular/core'
import { first, forkJoin, map, mergeMap, Observable, of, zip } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { dateFromString, isDay } from '../common/dates';
import { LotteryDraw } from '../common/lotterydraw';
import { DatabaseService } from './database.service';
import { DatePipe } from '@angular/common';


export enum DrawDay {
  Wednesday = 3,
  Saturday = 6,
  All = 7
}

@Injectable({
  providedIn: 'root',
})
export class LotteryService {

  private _archiveUrl: string =
    'https://www.westlotto.com/wlinfo/WL_InfoService?client=wlincl&gruppe=ZahlenUndQuoten&spielart=LOTTO&historie=ja'

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

  public readDraws(): Observable<LotteryDraw[]> {
    var archivedDates = this.http
      .get(`${this._archiveUrl}&jahr=${this._year}`, { responseType: 'text' })
      .pipe(  
        map(html => this.extractDates(html, this._day))
      )
    var savedDraws = this.database
      .queryLotteryDraws().valueChanges
      .pipe(
        first(),
        map(result => result.data.draws.map(d => LotteryDraw.fromObject(d)))
      )
      
    return zip(archivedDates, savedDraws)
      .pipe(
        mergeMap(([dates, draws]) =>
          forkJoin(dates.map(d => this.maySaveDraw(d, draws))))
      )
  }

  private maySaveDraw(date: Date, draws: LotteryDraw[]): Observable<LotteryDraw> {
    var savedDraw = draws.find(d => d.date.getTime() == date.getTime())
    if (savedDraw)
      return of(savedDraw)

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
