import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BSON } from 'realm-web';
import { Participation, snackBarConfig } from '../common/data';
import { ParticipationEnd, ParticipationService } from '../service/participation.service';
import { EndPariticipationDialog as EndParticipationDialog } from './end-participation.component';
import { DeletePariticipationDialog as RemoveParticipationDialog } from './delete-participation.component';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html'
})
export class ParticipationComponent implements OnInit {

  participation = {} as Participation;
  participations = [] as Participation[];
  displayedColumns = [
    'firstName',
    'lastName',
    'ticket',
    'start',
    'end',
    'actions'
  ];
  loading = true;
  error: any;

  constructor(
    private participationService: ParticipationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.participationService.subscribe(result => {
      this.participations = result.data.participations;
      this.loading = result.loading;
    });
  }

  onDeleteParticipation(id: BSON.ObjectID): void {
    var participation = this.participationService.getParticipation(id);
    if (participation === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Schließen', snackBarConfig);
      return;
    }

    const dialogRef = this.dialog
      .open(RemoveParticipationDialog, { data: participation });

    dialogRef.afterClosed().subscribe((remove: boolean) => {
      if (remove === undefined || !remove)
        return;

      this.participationService.removeParticipation(id!)
        .subscribe({
          next: result => {
            this.participationService.refetch();
            this.snackBar.open(`Teilnahme wurde entfernt`, 'Schließen', snackBarConfig);
          },
          error: error => {
            this.snackBar.open(`Teilnahme mit der ID ${id} konnte nicht entfernt werden: ${error}`, 'Schließen', snackBarConfig);
          }
        });
    });
  }

  onEndParticipation(id: BSON.ObjectID): void {
    var participation = this.participationService.getParticipation(id);
    if (participation === undefined) {
      this.snackBar.open(`Für die ID ${id} gibt es keine Teilnahme`, 'Schließen', snackBarConfig);
      return;
    }

    const dialogRef = this.dialog
      .open(EndParticipationDialog, { data: participation });

    dialogRef.afterClosed().subscribe((end: ParticipationEnd) => {
      if (end === undefined)
        return;

      this.participationService.endParticipation(participation?._id!, end);
      if (end === ParticipationEnd.Today)
        this.snackBar.open('Die Teilnahme wird heute beendet', 'Schließen', snackBarConfig);
      if (end === ParticipationEnd.EndOfQuarter)
        this.snackBar.open('Die Teilnahme wird zum Quartalsende beendet', 'Schließen', snackBarConfig);
      if (end === ParticipationEnd.None)
        this.snackBar.open('Die Teilnahme wird nicht beendet', 'Schließen', snackBarConfig);
    });
  }

  onRowClicked(row: Participation): void {
  }
}