import { Component, OnInit } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BSON } from 'realm-web';
import { Participation, snackBarConfig } from '../common/data';
import { ParticipationEnd, ParticipationService } from '../service/participation.service';
import { EndPariticipationDialog as EndParticipationDialog } from './end-participation.component';

export function createIbanValidator(): ValidatorFn {
  const regexp: RegExp = /^([A-Z]{2})(\d{2})(\d{18})$/gm;

  return (control: AbstractControl): ValidationErrors | null =>
    regexp.test(control.value) ? null : { iban: true };
}

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  styleUrls: ['./participation.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
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

  onRemoveParticipation(id: BSON.ObjectID): void {
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