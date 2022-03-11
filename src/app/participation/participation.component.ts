import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { snackBarConfig } from '../common/data'
import { ParticipationEnd, ParticipationService } from '../service/participation.service'
import { EndPariticipationDialog as EndParticipationDialog } from './dialog/end-participation.component'
import { DeletePariticipationDialog as RemoveParticipationDialog } from './dialog/delete-participation.component'
import { PariticipationDetailsDialog } from './dialog/participation-details.component'
import { ApolloError } from '@apollo/client/errors'
import { User } from '../common/user'
import { Participation } from '../common/participation'
import { DeleteUserDialog } from './dialog/delete-user.component'

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html'
})
export class ParticipationComponent implements OnInit {

  participations = [] as Participation[]
  users = [] as User[]
  participationColumns = [ 'ticket', 'name', 'start', 'end', 'actions' ]
  userColumns = [ 'name', 'actions' ]

  constructor(
    private participationService: ParticipationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    console.debug('on init participation compo')

    this.participationService
      .queryParticipations()
      .subscribe({
        next: participations => this.participations = participations,
        error: (error: ApolloError) => {
          this.snackBar.open(`Teilnahmeliste konnte nicht bezogen werden: ${error}`, 'Ok', snackBarConfig)
        }
      })

    this.participationService
      .queryUsers()
      .subscribe({
        next: users => this.users = users,
        error: (error: ApolloError) => {
          this.snackBar.open(`Teilnehmerliste konnte nicht bezogen werden: ${error}`, 'Ok', snackBarConfig)
        }
      })
  }

  public onInfo(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog.open(PariticipationDetailsDialog, { data: participation })
  }

  public onEnd(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog
      .open(EndParticipationDialog, { data: participation, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(when => this.endParticipation(participation._id!, when))
  }

  public onDelete(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog
      .open(RemoveParticipationDialog, { data: participation, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(del => this.deleteParticipation(participation._id!, del))
  }

  public onUserInfo(id: BSON.ObjectID): void {

  }

  public onDeleteUser(id: BSON.ObjectID): void {
    var user = this.getUser(id)

    this.dialog
      .open(DeleteUserDialog, { data: user, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(del => this.deleteUser(user._id!, del))
  }

  private endParticipation(id: BSON.ObjectID, when: ParticipationEnd): void {
    if (when === undefined)
      return

    this.participationService.endParticipation(id, when, {
      next: id => {
        if (when === ParticipationEnd.Today)
          this.snackBar.open('Die Teilnahme wird heute beendet', 'Gut', snackBarConfig)
        if (when === ParticipationEnd.EndOfQuarter)
          this.snackBar.open('Die Teilnahme wird zum Quartalsende beendet', 'Gut', snackBarConfig)
        if (when === ParticipationEnd.EndOfYear)
          this.snackBar.open('Die Teilnahme wird zum Jahresende beendet', 'Gut', snackBarConfig)
        if (when === ParticipationEnd.None)
          this.snackBar.open('Die Teilnahme wird nicht beendet', 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open('Die Teilnahme konnte nicht beendet werden', 'Ok', snackBarConfig)
    })
  }

  private deleteParticipation(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.participationService.deleteParticipation(id!, {
      next: id => this.snackBar.open(`Teilnahme wurde entfernt`, 'Gut', snackBarConfig),
      error: error => this.snackBar.open(`Teilnahme mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private deleteUser(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.participationService.deleteUser(id!, {
      next: id => this.snackBar.open(`Teilnehmer wurde entfernt`, 'Gut', snackBarConfig),
      error: error => this.snackBar.open(`Teilnehmer mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private getParticipation(id: BSON.ObjectID): Participation {
    var p = this.participations.find(p => p._id === id)
    if (p === undefined)
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Ok', snackBarConfig)
    return p!
  }

  private getUser(id: BSON.ObjectID): User {
    var u = this.users.find(u => u._id === id)
    if (u === undefined)
      this.snackBar.open(`Für die ID ${id} gibt es keinen Teilnahmer`, 'Ok', snackBarConfig)
    return u!
  }
}