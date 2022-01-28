import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BSON } from 'realm-web';
import { ModeOfPayment, Participation } from '../common/data';
import { WinningTicket } from '../common/winning-ticket';
import { ParticipationService } from '../service/participation.service';

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

  addForm = {} as FormGroup;
  participation = {} as Participation;
  participations = [] as Participation[];
  freeTickets = [] as WinningTicket[];
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

  constructor(private formBuilder: FormBuilder,
              private participationService: ParticipationService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      iban: [null, [Validators.required, createIbanValidator()]],
      ticket: [null, Validators.required],
      start: [null, Validators.required],
      end: [null]
    });
    this.participationService.subscribe(value => {
      this.participations = value.data.participations;
      this.loading = value.loading;
    });
    this.participationService.observeFreeTickets()
        .subscribe(tickets => this.freeTickets = tickets);
  }

  onAddParticipation(): void {
    this.participationService.addParticipation({
      user: {
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        payment: {
          mode: ModeOfPayment.BankTransfer,
          iban: this.iban.value
        }
      },
      ticket: WinningTicket.fromString(this.ticket.value),
      start: this.start.value,
      end: this.end.value
    });
    this.addForm.reset();
  }

  onRemoveParticipation(id: BSON.ObjectID): void {
    this.participationService.removeParticipation(id!);
  }

  onEndParticipation(id: BSON.ObjectID): void {
    var participation = this.participationService.getParticipation(id);  
    const dialogRef = this.dialog.open(EndPariticipationDialog, {
      data: { p: participation }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.debug(`dialog closed ${JSON.stringify(result)}`);
      if (result) {
        this.openSnackBar(`Message From Dialog: ${result}`, 'Close');
      }
    });
    //this.participationService.endParticipation(row._id!);
  }

  onRowClicked(row: Participation): void {
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'bottom',
      panelClass: ['mat-toolbar', 'mat-primary']
    });
  }

  get firstName() { return this.addForm.controls['firstName']; }
  get lastName() { return this.addForm.controls['lastName']; }
  get email() { return this.addForm.controls['email']; }
  get iban() { return this.addForm.controls['iban']; }
  get ticket() { return this.addForm.controls['ticket']; }
  get start() { return this.addForm.controls['start']; }
  get end() { return this.addForm.controls['end']; }

}

@Component({
  selector: 'end-participation',
  templateUrl: './end-participation.component.html',
  styleUrls: ['./end-participation.component.scss'],
})
export class EndPariticipationDialog {

  constructor(
    public dialogRef: MatDialogRef<EndPariticipationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Participation) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onEndParticipation(): void {
    console.debug(`clicked on end ${JSON.stringify(this.data)}`);
  }
}