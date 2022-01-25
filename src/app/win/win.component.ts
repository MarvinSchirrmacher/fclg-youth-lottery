import { Component, OnInit } from '@angular/core';
import { LotteryWin } from '../common/lotterywin';
import { LotteryWinService } from '../service/lotterywin.service';

@Component({
  selector: 'app-win',
  templateUrl: './win.component.html',
  styleUrls: ['./win.component.css']
})
export class WinComponent implements OnInit {

  wins = [] as LotteryWin[];
  displayedColumns = ["week", "date", "number", "winners"];

  constructor(private lotteryWin: LotteryWinService) { }

  ngOnInit(): void {
    this.lotteryWin.subscribe((value: LotteryWin[]) => {
      this.wins = value
    })
  }
}
