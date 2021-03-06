import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { concatMap, first, forkJoin, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { dateFromString, isDay } from '../common/dates';
import { Draw } from '../common/draw';
import { DatabaseService, QueryDrawsResult } from './database.service';


export enum DrawDay {
  Wednesday = 3,
  Saturday = 6,
  All = 7
}

interface DatesAndDraws {
  dates: Date[],
  draws: Draw[]
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

  constructor(
    private http: HttpClient,
    private database: DatabaseService,
    private datePipe: DatePipe) { }

  readYears(): Observable<number[]> {
    return this.http
      .get(this._archiveUrl, { responseType: 'text' })
      .pipe(
        map(html => this.extractYears(html))
      )
  }

  saveNewDraws(year: number, day: DrawDay): Observable<Draw[]> {
    return this.http
      .get(`${this._archiveUrl}&jahr=${year}`, { responseType: 'text' })
      .pipe(
        map(html => this.extractDates(html, day)),
        switchMap(dates => this.readDraws(dates)),
        concatMap(result => forkJoin(result.dates.map(d => this.maySaveDraw(d, result.draws))))
      )
  }

  queryDraws(from: Date, to: Date): Observable<Draw[]> {
    return this.database.queryDraws(from, to).valueChanges
      .pipe(map(result => result.data.draws.map(d => Draw.fromObject(d))))
  }

  queryYears(): Observable<number[]> {
    return this.database.queryYears().valueChanges
      .pipe(map(result => this.reduceToYears(result.data.draws)))
  }

  private reduceToYears(draws: Partial<Draw>[]): number[] {
    return draws.reduce((years, draw) => {
      if (!draw.date)
        return years

      let year = new Date(draw.date).getFullYear()
      if (year && !years.includes(year))
        years.push(year)
      return years
    }, [] as number[])
  }

  private readDraws(dates: Date[]): Observable<DatesAndDraws> {
    var firstDate = dates[dates.length - 1]
    var lastDate = dates[0]
    return this.database
      .queryDraws(firstDate, lastDate).valueChanges
      .pipe(
        first(),
        map(result => ({
          dates: dates,
          draws: result.data.draws.map(d => Draw.fromObject(d))
        }))
      )
  }

  private maySaveDraw(date: Date, draws: Draw[]): Observable<Draw> {
    var savedDraw = draws.find(d => d.date.getTime() == date.getTime())
    if (savedDraw)
      return of(savedDraw)

    return this.http
      .get(`${this._archiveUrl}&datum=${this.datePipe.transform(date, 'dd.MM.yyyy')}`, { responseType: 'text' })
      .pipe(
        map(html => this.extractDraw(html, date)),
        mergeMap(draw => this.saveDraw(draw))
      )
  }

  private saveDraw(draw: Draw): Observable<Draw> {
    return this.database
      .insertDraw(draw)
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

  private extractDraw(html: string, date: Date): Draw {
    var match = this._numbersRegExp.exec(html)
    if (!match || !match.groups)
      return {} as Draw

    var numbersHtml = match.groups['numbers']
    var numbers = [] as number[]
    while ((match = this._numberRegExp.exec(numbersHtml)) !== null)
      numbers.push(parseInt(match.groups!['number']))

    return new Draw(date, numbers, false)
  }
}
