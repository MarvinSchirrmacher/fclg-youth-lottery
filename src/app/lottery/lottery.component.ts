import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { concatMap, filter, Observable, of, switchMap } from 'rxjs'
import { snackBarConfig } from '../common/data'
import { Winner } from '../common/winner'
import { Draw } from '../common/draw'
import { DrawDay, LotteryService } from '../service/lottery.service'
import { LotteryWinService } from '../service/lotterywin.service'
import { MailService } from '../service/mail.service'
import { InformWinnerDialog } from './dialog/inform-winner'
import { PayWinnerDialog } from './dialog/pay-winner'
import { ResetProgressDialog } from './dialog/reset-progress'
import { DeleteWinnerDialog } from './dialog/delete-winner.component'
import { Observer } from '@apollo/client/core'

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
})
export class LotteryComponent implements OnInit {

  public form = {} as FormGroup
  public winners = [] as Winner[]
  public years = [] as number[]
  public draws = [] as Draw[]
  public winnersColumns: string[] = ['ticket', 'name', 'date', 'profit', 'actions']
  public drawsColumns: string[] = ['week', 'date', 'numbers']
  public winnersLoading: boolean = true
  public drawsLoading: boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private lottery: LotteryService,
    private lotteryWin: LotteryWinService,
    private mail: MailService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    console.debug('on init lottery component')

    this.form = this.formBuilder.group({
      year: [new Date().getFullYear()]
    })

    this.lottery
      .readYears()
      .subscribe(years => {
        this.years = years
        this.year.updateValueAndValidity({ emitEvent: true })
      })

    this.year.valueChanges
      .pipe(
        switchMap(year => this.lottery.saveNewDraws(parseInt(year), DrawDay.Saturday)),
        switchMap(draws => {
          var firstDate = draws[draws.length - 1].date
          var lastDate = draws[0].date
          return this.lottery.queryDraws(firstDate, lastDate)
        }))
      .subscribe(this.updateDraws)
  }

  public onInform(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(InformWinnerDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed()
      .pipe(
        filter(inform => inform),
        concatMap(() => this.informWinner(winner!))
      )
      .subscribe(informed => {
        if (!informed) return
        this.lotteryWin.setWinnerInformed(id)
        this.snackBar.open(`Der Gewinner wurde${informed ? '' : ' nicht'} informiert`, 'Ok', snackBarConfig)
      })
  }

  public onPay(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(PayWinnerDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed().subscribe((paid: boolean) => {
        if (paid) {
          this.lotteryWin.setWinnerPaid(id)
          this.winners.find(w => w._id == id)!.paid = true
          this.snackBar.open(`Der Gewinner wurde bezahlt`, 'Ok', snackBarConfig)
        }
      })
  }

  public onResetWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(ResetProgressDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed().subscribe((reset: boolean) => {
        if (reset) {
          let winner = this.winners.find(w => w._id == id)!
          winner.informed = false
          winner.paid = false
          this.snackBar.open(`Der Bearbeitungsstatus wurde zurückgesetzt`, 'Ok', snackBarConfig)
        }
      })
  }

  public onDeleteWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(DeleteWinnerDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(del => this.deleteWinner(winner._id!, del))
  }

  private updateDraws: Observer<Draw[]> = {
    next: draws => {
      console.debug(`new draws received ${JSON.stringify(draws)}`)
      this.draws = draws
      this.drawsLoading = false
      this.lotteryWin.updateWinners(draws)
        .pipe(switchMap(draws => this.lotteryWin.queryWinners(draws)))
        .subscribe(this.updateWinners)
    },
    error: error => this.snackBar.open(
      'Die Ziehungen konnten nicht aktualisiert werden\n' + error,
      'Ok', snackBarConfig)
  }

  private updateWinners: Observer<Winner[]> = {
    next: winners => {
      console.debug(`new winners received ${JSON.stringify(winners)}`)
      this.winners = winners
      this.winnersLoading = false
    },
    error: error => this.snackBar.open(
      'Die Gewinnnerinnen und Gewinner konnten nicht aktualisiert werden\n' + error,
      'Ok', snackBarConfig)
  }

  private informWinner(winner: Winner): Observable<any> {
    if (!winner.user.email)
      return of(true)

    return this.mail
      .address(winner.user.email)
      .reference(`Dein Gewinn beim FCLG-Jugendlotto`)
      .content(this.buildMailContent(winner))
      .send()
  }

  private buildMailContent(winner: Winner): string {
    return `Hallo ${winner.user.firstName} ${winner.user.lastName},
    
    am ${winner.draw.date.toLocaleDateString()} hat dein Gewinnlos ${winner.tickets[0]} gewonnen - Glückwunsch!
    
    Mit sportlichen Grüßen
    FC Löhne-Gohfeld`
  }

  private getWinner(id: BSON.ObjectID): Winner {
    var w = this.winners.find(w => w._id === id)
    if (w === undefined)
      this.snackBar.open(`Für die ID ${id} gibt es keinen Gewinner`, 'Ok', snackBarConfig)
    return w!
  }

  private deleteWinner(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.lotteryWin.deleteWinner(id!, {
      next: id => {
        this.snackBar.open(`Gewinner wurde entfernt`, 'Gut', snackBarConfig)
        this.lotteryWin.refetchWinners()
      },
      error: error => this.snackBar.open(`Gewinner mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  get year() { return this.form.get('year')! }
}
