import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { concatMap, map, Observable, of, Subscription, switchMap } from 'rxjs'
import { snackBarConfig } from '../common/common'
import { Winner } from '../common/winner'
import { Draw } from '../common/draw'
import { DrawDay, LotteryService } from '../service/lottery.service'
import { LotteryWinService } from '../service/lotterywin.service'
import { MailService } from '../service/mail.service'
import { InformWinnerData, InformWinnerDialog } from './dialog/inform-winner'
import { PayWinnerDialog } from './dialog/pay-winner'
import { ResetProgressDialog } from './dialog/reset-progress'
import { DeleteWinnerDialog } from './dialog/delete-winner.component'
import { Observer } from '@apollo/client/core'
import { posPronounAccMas, winnerNoun } from '../common/gendering'
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
    this.drawsSubscription = this.lottery.saveNewDraws(this.settings.settings.year, DrawDay.Saturday)
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

  openPayDialog(id: BSON.ObjectID): void {
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
              this.openInformDialog(id)
              this.lotteryWin.refetchWinners()
            },
            error: error => {
              this.snackBar.open(`Der Gewinn wurde nicht an ${name} ausgezahlt\n${error}`, 'Ok', snackBarConfig)
            }
          })
        })
  }

  openInformDialog(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(InformWinnerDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .pipe(
        concatMap(data => this.informWinner(data)
      ))
      .subscribe((data: InformWinnerData) => {
        let name = winner.user.name
        let g = winner.user.gender
        
        if (!data.sendEmail) {
          this.snackBar.open(`${name} wurde nicht über ${posPronounAccMas(g)} Gewinn informiert`, 'Ok', snackBarConfig)
          return
        }

        this.lotteryWin.saveWinnerInformedOn(id, data.informedOn!)
          .subscribe({
            next: result => {
              this.snackBar.open(`${name} wurde über ${posPronounAccMas(g)} Gewinn informiert`, 'Ok', snackBarConfig)
            },
            error: error => {
              this.snackBar.open(`${name} konnte nicht über ${posPronounAccMas(g)} Gewinn informiert werden\n${error}`, 'Ok', snackBarConfig)
            }
          })
        })
  }

  openResetDialog(id: BSON.ObjectID): void {
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

  openDeleteDialog(id: BSON.ObjectID): void {
    var winner = this.getWinner(id)

    this.dialog
      .open(DeleteWinnerDialog, { data: winner, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => this.deleteWinner(winner._id!, del))
  }

  openReEvaluateDialog(id: BSON.ObjectID): void {
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
      console.debug(JSON.stringify(winners, undefined, 2))
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

  private informWinner(data: InformWinnerData): Observable<InformWinnerData> {
    if (!data.sendEmail)
      return of(data)

    return this.mail
      .address(data.email!)
      .reference(data.reference!)
      .content(data.content!)
      .send()
      .pipe(
        map(date => {
          data.informedOn = date
          return data
        })
      )
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

  private deleteWinner(id: BSON.ObjectID, del: boolean): void {
    if (!del)
      return

    this.lotteryWin.deleteWinner(id!, {
      next: id => {
        this.snackBar.open(`Gewinner:in wurde entfernt`, 'Ok', snackBarConfig)
        this.lotteryWin.refetchWinners()
      },
      error: error => this.snackBar.open(`Gewinner:in mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  createInformText(winner: Winner): string {
    let g = winner.user.gender
    return winner.informedOn
      ? `${winnerNoun(g)} wurde am ${winner.informedOn} benachrichtigt`
      : `${winnerNoun(g)} benachrichtigen`
  }

  createPayText(winner: Winner): string {
    return winner.paidOn ? `Gewinn wurde am ${this.pipe.transform(winner.paidOn, 'dd.MM.yyyy') } ausgezahlt` : 'Gewinn auszahlen'
  }
}
