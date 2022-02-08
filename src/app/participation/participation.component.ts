import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { Participation, snackBarConfig } from '../common/data'
import { ParticipationEnd, ParticipationService } from '../service/participation.service'
import { EndPariticipationDialog as EndParticipationDialog } from './dialog/end-participation.component'
import { DeletePariticipationDialog as RemoveParticipationDialog } from './dialog/delete-participation.component'
import { PariticipationDetailsDialog } from './dialog/participation-details.component'
import { ApolloError } from '@apollo/client/errors'

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html'
})
export class ParticipationComponent implements OnInit {

  participation = {} as Participation
  participations = [] as Participation[]
  displayedColumns = [
    'name',
    'ticket',
    'start',
    'end',
    'actions'
  ]

  constructor(
    private participationService: ParticipationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.participationService.observeParticipations()
      .subscribe({
        next: ps => this.participations = ps,
        error: (error: ApolloError) => {
          this.snackBar.open(`Teilnehmerliste konnte nicht bezogen werden: ${error}`, 'Schließen', snackBarConfig)
        }
      })
  }

  onInfo(id: BSON.ObjectID): void {
    var participation = this.participationService.getCurrentParticipation(id)
    if (participation === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Schließen', snackBarConfig)
      return
    }

    this.dialog.open(PariticipationDetailsDialog, { data: participation })
  }

  onEnd(id: BSON.ObjectID): void {
    var participation = this.participationService.getCurrentParticipation(id)
    if (participation === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Schließen', snackBarConfig)
      return
    }

    const dialogRef = this.dialog
      .open(EndParticipationDialog, { data: participation })

    dialogRef.afterClosed().subscribe((end: ParticipationEnd) => {
      if (end === undefined)
        return

      this.participationService.endParticipation(participation?._id!, end, (id, error) => {
        if (id) {
          if (end === ParticipationEnd.Today)
            this.snackBar.open('Die Teilnahme wird heute beendet', 'Schließen', snackBarConfig)
          if (end === ParticipationEnd.EndOfQuarter)
            this.snackBar.open('Die Teilnahme wird zum Quartalsende beendet', 'Schließen', snackBarConfig)
          if (end === ParticipationEnd.EndOfYear)
            this.snackBar.open('Die Teilnahme wird zum Jahresende beendet', 'Schließen', snackBarConfig)
          if (end === ParticipationEnd.None)
            this.snackBar.open('Die Teilnahme wird nicht beendet', 'Schließen', snackBarConfig)
        }
        if (error) {
          this.snackBar.open('Die Teilnahme konnte nicht beendet werden', 'Schließen', snackBarConfig)
        }
      })
    })
  }

  onDelete(id: BSON.ObjectID): void {
    var participation = this.participationService.getCurrentParticipation(id)
    if (participation === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Schließen', snackBarConfig)
      return
    }

    const dialogRef = this.dialog
      .open(RemoveParticipationDialog, { data: participation })

    dialogRef.afterClosed().subscribe((remove: boolean) => {
      if (remove === undefined || !remove)
        return

      this.participationService.deleteParticipation(id!, (id, error) => {
        if (id) {
          this.snackBar.open(`Teilnahme wurde entfernt`, 'Schließen', snackBarConfig)
        }
        if (error) {
          this.snackBar.open(`Teilnahme mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Schließen', snackBarConfig)
        }
      })
    })
  }
}