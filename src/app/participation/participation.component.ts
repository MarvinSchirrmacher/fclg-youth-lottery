import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { contains, empty, remove, snackBarConfig } from '../common/common'
import { ParticipationEnd, ParticipationService } from '../service/participation.service'
import { EndPariticipationDialog as EndParticipationDialog } from './dialog/end-participation.component'
import { DeletePariticipationDialog, DeletePariticipationDialog as RemoveParticipationDialog } from './dialog/delete-participation.component'
import { PariticipationDetailsDialog } from './dialog/participation-details.component'
import { ApolloError } from '@apollo/client/errors'
import { User } from '../common/user'
import { Participation } from '../common/participation'
import { DeleteUserDialog } from './dialog/delete-user.component'
import { article, participantNoun } from '../common/gendering'
import { EditUserDialog } from './dialog/edit-user.component'
import { Subscription } from 'rxjs'
import { ListSelection } from '../common/lists'

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html'
})
export class ParticipationComponent implements OnInit, OnDestroy {

  participations = [] as Participation[]
  users = [] as User[]
  participationColumns = [ 'ticket', 'name', 'term', 'actions' ]
  userColumns = [ 'name', 'actions' ]
  participationsLoading: boolean = true
  participantsLoading: boolean = true

  selectedParticipations: ListSelection<BSON.ObjectID> = new ListSelection<BSON.ObjectID>()
  selectedUsers: ListSelection<BSON.ObjectID> = new ListSelection<BSON.ObjectID>()
  
  private participationsSubscription: Subscription | undefined
  private usersSubscription: Subscription | undefined

  constructor(
    private participationService: ParticipationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.participationsSubscription = this.participationService
      .queryParticipations()
      .subscribe({
        next: participations => {
          this.participations = participations
          this.participationsLoading = false
        },
        error: (error: ApolloError) => {
          this.snackBar.open(`Teilnahmeliste konnte nicht bezogen werden: ${error}`, 'Ok', snackBarConfig)
        }
      })

    this.usersSubscription = this.participationService
      .queryUsers()
      .subscribe({
        next: users => {
          this.users = users
          this.participantsLoading = false
        },
        error: (error: ApolloError) => {
          this.snackBar.open(`Teilnehmerliste konnte nicht bezogen werden: ${error}`, 'Ok', snackBarConfig)
        }
      })
  }

  ngOnDestroy(): void {
    this.participationsSubscription?.unsubscribe()
    this.usersSubscription?.unsubscribe()
  }

  onInfo(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog.open(PariticipationDetailsDialog, { data: participation, maxWidth: '' })
  }

  onEnd(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog
      .open(EndParticipationDialog, { data: [participation], panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(when => this.endParticipation(participation._id!, when))
  }

  onDelete(id: BSON.ObjectID): void {
    var participation = this.getParticipation(id)

    this.dialog
      .open(RemoveParticipationDialog, { data: [participation], panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => this.deleteParticipation(participation._id!, del))
  }

  onEditUser(id: BSON.ObjectID): void {
    var user = this.getUser(id)

    this.dialog
      .open(EditUserDialog, { data: user, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(editedUser => this.editUser(user._id!, editedUser))
  }

  onDeleteUser(id: BSON.ObjectID): void {
    var user = this.getUser(id)

    this.dialog
      .open(DeleteUserDialog, { data: [user], panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => this.deleteUser(user._id!, del))
  }

  selectParticipation(id: BSON.ObjectID): void {
    this.selectedParticipations.select(id)
  }

  participationIsSelected(id: BSON.ObjectID): boolean {
    return this.selectedParticipations.isSelected(id)
  }

  anyIsSelected(): boolean {
    return this.selectedParticipations.anyIsSelected()
  }

  endAllSelected(): void {
    var participations = this.selectedParticipations.get().map(id => this.getParticipation(id))

    this.dialog
      .open(EndParticipationDialog, { data: participations, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(end => {
        if (participations.length == 1)
          this.endParticipation(this.selectedParticipations.get()[0], end)
        else
          this.endParticipations(this.selectedParticipations.get(), end)
        this.selectedParticipations.deselectAll()
      })
  }

  deleteAllSelected(): void {
    var participations = this.selectedParticipations.get().map(id => this.getParticipation(id))

    this.dialog
      .open(DeletePariticipationDialog, { data: participations, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => {
        this.deleteParticipations(this.selectedParticipations.get(), del)
        this.selectedParticipations.deselectAll()
      })
  }

  selectUser(id: BSON.ObjectID): void {
    this.selectedUsers.select(id)
  }

  userIsSelected(id: BSON.ObjectID): boolean {
    return this.selectedUsers.isSelected(id)
  }

  anyUserIsSelected(): boolean {
    return this.selectedUsers.anyIsSelected()
  }

  deleteAllSelectedUsers(): void {
    var users = this.selectedUsers.get().map(id => this.getUser(id))

    this.dialog
      .open(DeleteUserDialog, { data: users, panelClass: 'w-600px', maxWidth: '' })
      .afterClosed()
      .subscribe(del => {
        this.deleteUsers(this.selectedUsers.get(), del)
        this.selectedUsers.deselectAll()
      })
  }

  private endParticipation(id: BSON.ObjectID, end: ParticipationEnd): void {
    if (end === undefined)
      return

    var name = this.getParticipation(id).user.name
    this.participationService.endParticipation(id, end, {
      next: id => {
        this.participationService.refetch()
        let endDescription = this.getEndDescription(end)
        this.snackBar.open(`Die Teilnahme von ${name} wird ${endDescription} beendet`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`Die Teilnahme konnte nicht beendet werden\n${error}`, 'Ok', snackBarConfig)
    })
  }

  private endParticipations(ids: BSON.ObjectID[], end: ParticipationEnd): void {
    if (end === undefined)
      return

    this.participationService.endParticipations(ids, end, {
      next: count => {
        this.participationService.refetch()
        let endDescription = this.getEndDescription(end)
        this.snackBar.open(`Die ${count} Teilnahmen werden ${endDescription} beendet`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`Die Teilnahmen konnten nicht beendet werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private getEndDescription(end: ParticipationEnd): string {
    if (end === ParticipationEnd.Today)
      return 'heute'
    if (end === ParticipationEnd.EndOfQuarter)
      return 'zum Quartalsende'
    if (end === ParticipationEnd.EndOfYear)
      return 'zum Jahresende'
    return 'nicht'
  }

  private deleteParticipation(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    var name = this.getParticipation(id).user.name
    this.participationService.deleteParticipation(id!, {
      next: id => {
        this.participationService.refetch()
        this.snackBar.open(`Die Teilnahme von ${name} wurde entfernt`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`Die Teilnahme von ${name} konnte nicht entfernt werden\n${error}`, 'Ok', snackBarConfig)
    })
  }

  private deleteParticipations(ids: BSON.ObjectID[], del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.participationService.deleteParticipations(ids, {
      next: count => {
        this.participationService.refetch()
        this.snackBar.open(`${count} Teilnahmen wurden entfernt`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`Die Teilnahmen konnten nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private editUser(id: BSON.ObjectID, user: User | undefined): void {
    if (user === undefined)
      return

    this.participationService.updateUser(id, user, {
      next: id => this.snackBar.open(`${article(user.gender).capitalize()} ${participantNoun(user.gender)} ${user.name} wurde aktualisiert`, 'Ok', snackBarConfig),
      error: error => this.snackBar.open(`${article(user.gender).capitalize()} ${participantNoun(user.gender)} ${user.name} konnte nicht aktualisiert werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private deleteUser(id: BSON.ObjectID, del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    var participant = this.getParticipation(id)
    var name = participant.user.name
    var g = participant.user.gender
    this.participationService.deleteUser(id!, {
      next: id => {
        this.participationService.refetch()
        this.snackBar.open(`${article(g)} ${participantNoun} ${name} wurde entfernt`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`${article(g)} ${participantNoun} ${name} konnte nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
    })
  }

  private deleteUsers(ids: BSON.ObjectID[], del: boolean | undefined): void {
    if (del === undefined || !del)
      return

    this.participationService.deleteUsers(ids, {
      next: count => {
        this.participationService.refetch()
        this.snackBar.open(`${count} Teilnehmerinnen und Teilnehmer wurden entfernt`, 'Ok', snackBarConfig)
      },
      error: error => this.snackBar.open(`Die Teilnehmerinnen und Teilnehmer konnten nicht entfernt werden: ${error}`, 'Ok', snackBarConfig)
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