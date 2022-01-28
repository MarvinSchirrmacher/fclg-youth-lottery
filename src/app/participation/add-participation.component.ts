import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ModeOfPayment, Participation } from '../common/data';
import { WinningTicket } from '../common/winning-ticket';
import { ParticipationService } from '../service/participation.service';

export function createIbanValidator(): ValidatorFn {
  const regexp: RegExp = /^([A-Z]{2})(\d{2})(\d{18})$/gm;

  return (control: AbstractControl): ValidationErrors | null =>
    regexp.test(control.value) ? null : { iban: true };
}

@Component({
  selector: 'app-add-participation',
  templateUrl: './add-participation.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
})
export class AddParticipationComponent implements OnInit {

  form = {} as FormGroup;
  participation = {} as Participation;
  freeTickets = [] as WinningTicket[];

  constructor(private formBuilder: FormBuilder,
              private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      iban: [null, [Validators.required, createIbanValidator()]],
      ticket: [null, Validators.required],
      start: [null, Validators.required],
      end: [null]
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
    this.form.reset();
  }

  get firstName() { return this.form.controls['firstName']; }
  get lastName() { return this.form.controls['lastName']; }
  get email() { return this.form.controls['email']; }
  get iban() { return this.form.controls['iban']; }
  get ticket() { return this.form.controls['ticket']; }
  get start() { return this.form.controls['start']; }
  get end() { return this.form.controls['end']; }

}