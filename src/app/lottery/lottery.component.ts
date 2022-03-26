import { Component, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { concatMap, filter, Observable, of, Subscription, switchMap } from 'rxjs'
import { snackBarConfig } from '../common/common'
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
import { posPronounAccMas } from '../common/gendering'
import { SettingsService } from '../service/settings.service'

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
  public drawsColumns: string[] = ['week', 'date', 'numbers', 'actions']
  public winnersLoading: boolean = true
  public drawsLoading: boolean = true
  private winnersSubscription: Subscription | undefined

  constructor(
    private settings: SettingsService,
    private lottery: LotteryService,
    private lotteryWin: LotteryWinService,
    private mail: MailService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    console.debug('on init lottery')
    this.lottery.saveNewDraws(this.settings.year, DrawDay.Saturday)
      .pipe(
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
      .subscribe((informedOn: Date) => {
        if (!informedOn) return

        let name = winner.user.name
        let g = winner.user.gender
        this.lotteryWin.saveWinnerInformedOn(id, informedOn)
          .subscribe({
            next: result => {
              this.snackBar.open(`${name} wurde über ${posPronounAccMas(g)} Gewinn informiert`, 'Ok', snackBarConfig)
              this.lotteryWin.refetchWinners()
            },
            error: error => {
              this.snackBar.open(`${name} wurde nicht über ${posPronounAccMas(g)} Gewinn informiert\n${error}`, 'Ok', snackBarConfig)
            }
          })
        })
  }

  public onPay(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(PayWinnerDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed().subscribe((paidOn: Date) => {
        if (!paidOn) return

        let name = winner.user.name
        let g = winner.user.gender
        this.lotteryWin.saveWinnerPaidOn(id, paidOn)
          .subscribe({
            next: result => {
              this.snackBar.open(`Der Gewinn wurde an ${name} ausgezahlt`, 'Ok', snackBarConfig)
              this.lotteryWin.refetchWinners()
            },
            error: error => {
              this.snackBar.open(`Der Gewinn wurde nicht an ${name} ausgezahlt\n${error}`, 'Ok', snackBarConfig)
            }
          })
        })
  }

  public onResetWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(ResetProgressDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed().subscribe((reset: boolean) => {
        if (!reset) return

        let name = winner.user.name
        this.lotteryWin.resetWinner(id)
          .subscribe({
            next: result => {
              this.snackBar.open(`Der Bearbeitungsstatus des Gewinns von ${name} wurde zurückgesetzt`, 'Ok', snackBarConfig)
              this.lotteryWin.refetchWinners()
            },
            error: error => {
              this.snackBar.open(`Der Bearbeitungsstatus des Gewinns von ${name} konnte nicht zurückgesetzt werden\n${error}`, 'Ok', snackBarConfig)
            }
          })
      })
  }

  public onDeleteWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(DeleteWinnerDialog, { data: winner, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(del => this.deleteWinner(winner._id!, del))
  }

  public onReEvaluateDraw(id: BSON.ObjectID): void {
    var draw = this.getDraw(id)
    draw.reset()
    this.winnersSubscription?.unsubscribe()
    this.winnersSubscription = this.lotteryWin.updateWinners([draw])
      .pipe(switchMap(draws => this.lotteryWin.queryWinners(this.draws)))
      .subscribe(this.updateWinners)
  }

  private updateDraws: Observer<Draw[]> = {
    next: draws => {
      this.draws = draws
      this.drawsLoading = false
      this.winnersSubscription?.unsubscribe()
      this.winnersSubscription = this.lotteryWin.updateWinners(draws)
        .pipe(switchMap(draws => this.lotteryWin.queryWinners(draws)))
        .subscribe(this.updateWinners)
    },
    error: error => this.snackBar.open(
      'Die Ziehungen konnten nicht aktualisiert werden\n' + error,
      'Ok', snackBarConfig)
  }

  private updateWinners: Observer<Winner[]> = {
    next: winners => {
      this.winners = winners
      this.winnersLoading = false
    },
    error: error => this.snackBar.open(
      'Die Gewinnnerinnen und Gewinner konnten nicht aktualisiert werden\n' + error,
      'Ok', snackBarConfig)
  }

  private informWinner(winner: Winner): Observable<Date> {
    if (!winner.user.email)
      return of(new Date())

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

  private getDraw(id: BSON.ObjectID): Draw {
    var d = this.draws.find(d => d._id === id)
    if (d === undefined)
      this.snackBar.open(`Für die ID ${id} gibt es keine Ziehung`, 'Ok', snackBarConfig)
    return d!
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
}
