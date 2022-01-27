import { Component, OnInit } from '@angular/core';
import { LotteryDraw } from '../common/lotterydraw';
import { LotteryWinService } from '../service/lotterywin.service';

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.css'],
})
export class LotteryComponent implements OnInit {
  public wins = [] as LotteryDraw[];
  public displayedColumns: string[] = [
    'date',
    'numbers',
    'winners',
    'processed'
  ];

  constructor(private lotteryWin: LotteryWinService) {}

  public ngOnInit(): void {
    this.lotteryWin.subscribe((value: LotteryDraw[]) => {
      this.wins = value
    })
  }
}
