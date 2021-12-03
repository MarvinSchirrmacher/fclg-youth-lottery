import { HttpService } from './http.service';
import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

interface LotteryDraw {
  date: Date;
  id: number;
  calendarweek: number;
  numbers: number[];
  winningNumber: number;
}

@Injectable({
  providedIn: 'root',
})
export class LotteryArchiveService {
  private urlAllDraws: string =
    'https://johannesfriedrich.github.io/LottoNumberArchive/Lottonumbers_complete.json';

  constructor(private httpService: HttpService) {}

  public async getAllDrawsAfter(date: Date): Promise<LotteryDraw[]> {
    return new Promise((resolve, reject) => {
      this.httpGetAllDraws()
        .then((success: LotteryDraw[]) => {
          var lotteryDraws: LotteryDraw[] = [];
          for (let draw of success) {
            if (draw.date.getTime() >= date.getTime()) {
              lotteryDraws.push(draw);
            }
          }
          resolve(lotteryDraws);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async getAllDrawsBefore(date: Date): Promise<LotteryDraw[]> {
    return new Promise((resolve, reject) => {
      this.httpGetAllDraws()
        .then((success: LotteryDraw[]) => {
          var lotteryDraws: LotteryDraw[] = [];
          for (let draw of success) {
            if (draw.date.getTime() <= date.getTime()) {
              lotteryDraws.push(draw);
            }
          }
          resolve(lotteryDraws);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async getAllDrawsOfYear(year: number): Promise<LotteryDraw[]> {
    return new Promise((resolve, reject) => {
      this.httpGetAllDraws()
        .then((success: LotteryDraw[]) => {
          var lotteryDraws: LotteryDraw[] = [];
          for (let draw of success) {
            if (draw.date.getFullYear() == year) {
              lotteryDraws.push(draw);
            }
          }
          resolve(lotteryDraws);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public getLatestDraw(): Promise<LotteryDraw> {
    return new Promise((resolve, reject) => {
      this.httpGetAllDraws()
        .then((success: LotteryDraw[]) => {
          resolve(success[success.length - 1]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public async httpGetAllDraws(): Promise<LotteryDraw[]> {
    return new Promise((resolve, reject) => {
      this.httpService.get(this.urlAllDraws).subscribe({
        next: (value: any) => resolve(this.convertHttpInput(value.data)),
        error: (error) => reject(error),
      });
    });
  }

  convertHttpInput(data: any[]): LotteryDraw[] {
    var lotteryDraws: LotteryDraw[] = [];
    data.forEach((element) => {
      var datestring: string = element.date;
      var day = Number(datestring.substring(0, 2));
      var month = Number(datestring.substring(3, 5));
      var year = Number(datestring.substring(6, 10));

      lotteryDraws.push({
        id: element.id,
        date: new Date(year, month - 1, day),
        calendarweek: this.getWeekNumber(new Date(year, month - 1, day)),
        numbers: element.Lottozahl,
        winningNumber: element.Lottozahl[0],
      });
    });

    lotteryDraws.sort(this.sortIdDesc);
    return lotteryDraws;
  }

  private sortIdDesc(draw1: LotteryDraw, draw2: LotteryDraw): number {
    if (draw1.id > draw2.id) {
      return -1;
    } else {
      return 1;
    }
  }

  private sortDateDesc(draw1: LotteryDraw, draw2: LotteryDraw): number {
    if (draw1.date.getTime() > draw2.date.getTime()) {
      return -1;
    } else {
      return 1;
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
