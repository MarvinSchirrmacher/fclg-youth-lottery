import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LotteryArchiveService } from '../lotteryarchive.service';
import { MatTable } from '@angular/material/table';

interface LotteryDraw {
  date: Date;
  id: number;
  numbers: number[];
  calendarweek: number;
  winningNumber: number;
}

@Component({
  selector: 'app-lotterydata',
  templateUrl: './lotterydata.component.html',
  styleUrls: ['./lotterydata.component.css'],
})
export class LotterydataComponent implements OnInit {
  public lotteryDraws: LotteryDraw[] = [];
  private today = new Date();

  displayedColumns: string[] = [
    'calendarweek',
    'date',
    'numbers',
    'winningNumber',
  ];

  constructor(private lotteryArchive: LotteryArchiveService) {
    this.setLotterydraws();
  }

  public ngOnInit(): void {}

  public onClickRow(row: LotteryDraw) {}

  private setLotterydraws() {
    this.lotteryArchive
      .getAllDrawsOfYear(this.today.getFullYear())
      .then((success: LotteryDraw[]) => {
        this.lotteryDraws = success;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
