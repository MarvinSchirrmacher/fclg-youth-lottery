import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { snackBarConfig } from '../common/data'
import { LotteryWinner } from '../common/lottery-winner'
import { LotteryDraw } from '../common/lotterydraw'
import { DrawDay, LotteryService } from '../service/lottery.service'
import { LotteryWinService } from '../service/lotterywin.service'
import { InformWinnerDialog } from './dialog/inform-winner'
import { PayWinnerDialog } from './dialog/pay-winner'
import { ResetProgressDialog } from './dialog/reset-progress'

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
})
export class LotteryComponent implements OnInit {
  public winners = [] as LotteryWinner[]
  public draws = [] as LotteryDraw[]
  public winnersColumns: string[] = ['ticket', 'name', 'date', 'actions']
  public drawsColumns: string[] = ['week', 'date', 'numbers']

  constructor(
    private lottery: LotteryService,
    private lotteryWin: LotteryWinService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    this.lottery
      .year(new Date().getFullYear() - 1)
      .day(DrawDay.Saturday)
      .readDraws()
      .subscribe(draws => this.draws = draws)
    // this.lotteryWin.observeWinners()
    //   .subscribe(winners => this.winners = winners)
  }

  public onInform(id: BSON.ObjectID): void {
    var winner = this.winners.find(w => w._id == id)
    if (winner === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keinen Gewinner`, 'Ok', snackBarConfig)
      return
    }

    this.dialog
      .open(InformWinnerDialog, { data: winner, panelClass: 'w-600p' })
      .afterClosed().subscribe((informed: boolean) => {
        if (informed == undefined) return
        this.lotteryWin.setWinnerInformed(id)
        this.winners.find(w => w._id == id)!.informed = true
        if (informed) {
          this.snackBar.open(`Der Gewinner wurde informiert`, 'Ok', snackBarConfig)
        } else {
          this.snackBar.open('Der Gewinner wird nicht informiert', 'Ok', snackBarConfig)
        }
      })
  }

  public onPay(id: BSON.ObjectID): void {
    var winner = this.winners.find(w => w._id == id)
    if (winner === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keinen Gewinner`, 'Ok', snackBarConfig)
      return
    }

    this.dialog
      .open(PayWinnerDialog, { data: winner, panelClass: 'w-600p' })
      .afterClosed().subscribe((paid: boolean) => {
        if (paid) {
          this.lotteryWin.setWinnerPaid(id)
          this.winners.find(w => w._id == id)!.paid = true
          this.snackBar.open(`Der Gewinner wurde bezahlt`, 'Ok', snackBarConfig)
        }
      })
  }

  public onReset(id: BSON.ObjectID): void {
    var winner = this.winners.find(w => w._id == id)
    if (winner === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keinen Gewinner`, 'Ok', snackBarConfig)
      return
    }

    this.dialog
      .open(ResetProgressDialog, { data: winner, panelClass: 'w-600p' })
      .afterClosed().subscribe((reset: boolean) => {
        if (reset) {
          let winner = this.winners.find(w => w._id == id)!
          winner.informed = false
          winner.paid = false
          this.snackBar.open(`Der Bearbeitungsstatus wurde zurückgesetzt`, 'Ok', snackBarConfig)
        }
      })
  }
}
