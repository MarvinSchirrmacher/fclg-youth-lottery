import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { snackBarConfig } from '../common/data'
import { LotteryWinner } from '../common/lottery-winner'
import { LotteryDraw } from '../common/lotterydraw'
import { LotteryWinService } from '../service/lotterywin.service'

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.css'],
})
export class LotteryComponent implements OnInit {
  public winners = [] as LotteryWinner[]
  public draws = [] as LotteryDraw[]
  public winnersColumns: string[] = ['date', 'name', 'ticket', 'actions']
  public drawsColumns: string[] = ['date', 'numbers']

  constructor(
    private lotteryWin: LotteryWinService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {}

  public ngOnInit(): void {
    this.lotteryWin.observeDraws()
      .subscribe(draws => this.draws = draws)
    this.lotteryWin.observeWinners()
      .subscribe(winners => this.winners = winners)
  }

  public onInform(id: BSON.ObjectID): void {
    this.snackBar.open('Informiert', 'Ok', snackBarConfig)
  }

  public onPay(id: BSON.ObjectID): void {
    this.snackBar.open('Bezahlt', 'Ok', snackBarConfig)
  }
}
