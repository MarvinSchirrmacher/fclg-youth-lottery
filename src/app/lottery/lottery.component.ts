import { Component, OnDestroy, OnInit } from '@angular/core'
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
import { ReEvaluateDrawDialog } from './dialog/reevaluate-draw'
import { TaggableList } from '../common/lists'
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
})
export class LotteryComponent implements OnInit, OnDestroy {

  pipe = new DatePipe('de-DE');

  form = {} as FormGroup
  winners = [] as Winner[]
  years = [] as number[]
  draws: TaggableList<Draw> = TaggableList.empty()
  winnersColumns: string[] = ['name', 'ticket', 'week', 'profit', 'actions']
  drawsColumns: string[] = ['week', 'date', 'numbers', 'actions']
  winnersLoading: boolean = true
  drawsLoading: boolean = true
  
  private drawsSubscription: Subscription | undefined
  private winnersSubscription: Subscription | undefined

  constructor(
    private settings: SettingsService,
    private lottery: LotteryService,
    private lotteryWin: LotteryWinService,
    private mail: MailService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.drawsSubscription = this.lottery.saveNewDraws(this.settings.year, DrawDay.Saturday)
      .pipe(
        switchMap(draws => {
          var firstDate = draws[draws.length - 1].date
          var lastDate = draws[0].date
          return this.lottery.queryDraws(firstDate, lastDate)
        }))
      .subscribe(this.updateDraws)
  }

  ngOnDestroy(): void {
    this.drawsSubscription?.unsubscribe()
    this.winnersSubscription?.unsubscribe()
  }

  onInform(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(InformWinnerDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
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

  onPay(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(PayWinnerDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
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

  onResetWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(ResetProgressDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
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

  onDeleteWinner(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(DeleteWinnerDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => this.deleteWinner(winner._id!, del))
  }

  onReEvaluateDraw(id: BSON.ObjectID): void {
    var draw = this.getDraw(id)

    this.dialog
      .open(ReEvaluateDrawDialog, { data: draw, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(evaluate => this.reEvaluateDraw(draw, evaluate))
  }

  private reEvaluateDraw(draw: Draw, evaluate: boolean): void {
    if (!evaluate) return

    this.draws.tag(draw)
    draw.reset()
    this.winnersSubscription?.unsubscribe()
    this.winnersSubscription = this.lotteryWin.updateWinners([draw])
      .pipe(switchMap(draws => this.lotteryWin.queryWinners(this.draws.export())))
      .subscribe({
        next: winners => {
          if (winners.length == this.winners.length)
            this.snackBar.open(
              `Keine neuen Gewinnnerinnen und Gewinner für die Ziehung vom ${this.pipe.transform(draw.date, 'dd.MM.yyyy')}`,
              'Ok', snackBarConfig)
          this.winners = winners
          this.draws.untag(draw)
          this.winnersLoading = false
        },
        error: error => {
          this.snackBar.open(
            'Die Gewinnnerinnen und Gewinner konnten nicht erneut ermittelt werden\n' + error,
            'Ok', snackBarConfig)
          this.draws.untag(draw)
          this.winnersLoading = false
        }
      })
  }

  private updateDraws: Observer<Draw[]> = {
    next: draws => {
      this.draws = new TaggableList<Draw>(draws, (a, b) => a._id === b._id)
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
    error: error => {
      this.snackBar.open(
      'Die Gewinnnerinnen und Gewinner konnten nicht aktualisiert werden\n' + error,
      'Ok', snackBarConfig)
      this.winnersLoading = false
    }
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
    var d = this.draws.export().find(d => d._id === id)
    if (d === undefined)
      this.snackBar.open(`Für die ID ${id} gibt es keine Ziehung`, 'Ok', snackBarConfig)
    return d!
  }

  private deleteWinner(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.lotteryWin.deleteWinner(id!, {
      next: id => {
        this.snackBar.open(`Gewinner wurde entfernt`, 'Ok', snackBarConfig)
        this.lotteryWin.refetchWinners()
      },
      error: error => this.snackBar.open(`Gewinner mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }
}
