import { Component, OnInit } from '@angular/core';
import { LotteryWin } from '../common/lotterywin';
import { LotteryWinService } from '../service/lotterywin.service';

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.css'],
})
export class LotteryComponent implements OnInit {
  public wins = [] as LotteryWin[];
  public displayedColumns: string[] = [
    'date',
    'numbers',
    'winners'
  ];

  constructor(private lotteryWin: LotteryWinService) {}

  public ngOnInit(): void {
    this.lotteryWin.subscribe((value: LotteryWin[]) => {
      this.wins = value
    })
  }
}
