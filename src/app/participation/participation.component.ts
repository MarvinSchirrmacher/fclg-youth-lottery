import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ModeOfPayment, Participation, WinningTicket } from '../common/data';
import { ParticipationService } from '../service/participation.service';

export class ParticipationTickets {
  private static regexp = new RegExp(/^L(?<list>\d+)N(?<number>\d+)$/gm)

  public static toString(ticket: WinningTicket): string {
    return ticket ? `L${ticket.list}N${ticket.number}` : '';
  }

  public static fromString(value: string): WinningTicket {
    var exec = this.regexp.exec(value);
    if (exec?.groups === undefined)
      throw new Error(`value "${value}" does not match ticket pattern L<list>N<number>`);

    return {
      list: parseInt(exec?.groups['list']),
      number: parseInt(exec?.groups['number'])
    };
  }
}

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
              private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      firstName: [this.participation.user?.firstName, Validators.required],
      lastName: [this.participation.user?.lastName, Validators.required],
      email: [this.participation.user?.email, [Validators.required, Validators.email]],
      iban: [this.participation.user?.payment?.iban, [Validators.required, createIbanValidator()]],
      ticket: [ParticipationTickets.toString(this.participation.ticket), Validators.required],
      start: [this.participation.start, Validators.required],
      end: [this.participation.end]
    });
    this.participationService.subscribe(value => {
      this.participations = value.data.participations;
      this.loading = value.loading;
    })
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
      ticket: ParticipationTickets.fromString(this.ticket.value),
      start: this.start.value,
      end: this.end.value
    });
    this.addForm.reset();
  }

  onRemoveParticipation(row: Participation): void {
    this.participationService.removeParticipation(row._id!);
  }

  onEndParticipation(row: Participation): void {
    this.participationService.endParticipation(row._id!);
  }

  onRowClicked(row: Participation): void {
  }

  get firstName() { return this.addForm.controls['firstName']; }
  get lastName() { return this.addForm.controls['lastName']; }
  get email() { return this.addForm.controls['email']; }
  get iban() { return this.addForm.controls['iban']; }
  get ticket() { return this.addForm.controls['ticket']; }
  get start() { return this.addForm.controls['start']; }
  get end() { return this.addForm.controls['end']; }

}
