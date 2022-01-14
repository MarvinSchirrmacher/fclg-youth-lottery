import { Component, OnInit } from '@angular/core';
import { LotteryArchiveService } from '../lotteryarchive.service';

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
      .then((draws: LotteryDraw[]) => this.lotteryDraws = draws)
      .catch((error) => console.log(error));
  }
}
