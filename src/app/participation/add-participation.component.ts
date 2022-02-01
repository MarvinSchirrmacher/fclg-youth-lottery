import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfitDistributionMethod, Participation, snackBarConfig } from '../common/data';
import { startOfNextQuarter } from '../common/dates';
import { WinningTicket } from '../common/winning-ticket';
import { ParticipationService } from '../service/participation.service';

@Component({
  selector: 'app-add-participation',
  templateUrl: './add-participation.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
})
export class AddParticipationComponent implements OnInit {

  readonly nameValidator = Validators.pattern(/^([a-zA-Z]+( |-)?)+$/);
  readonly phoneValidator = Validators.pattern(/^(\+\d{2}|0)( )?(\d{3})( )?(\d{4,9})$/);
  readonly ibanValidator = Validators.pattern(/^([A-Za-z]{2})(\d{2})(\d{18})$/);

  form = {} as FormGroup;
  participation = {} as Participation;
  freeTickets = [] as WinningTicket[];
  profitDistributionMethods: string[] = Object.values(ProfitDistributionMethod);

  constructor(private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required, this.nameValidator],
      lastName: ['', Validators.required, this.nameValidator],
      ticket: ['', Validators.required],
      start: ['', Validators.required],
      end: [''],
      email: ['', [Validators.email]],
      phone: ['', [this.phoneValidator]],
      address: this.formBuilder.group({
        street: [''],
        city: [''],
        postalCode: ['']
      }),
      payment: this.formBuilder.group({
        distribution: [ProfitDistributionMethod.BankTransfer, [Validators.required]],
        iban: ['', [Validators.required, this.ibanValidator]],
        paypal: ['', [Validators.email]]
      })
    });
    this.participationService.observeFreeTickets()
        .subscribe(tickets => this.freeTickets = tickets);
  }

  onAddParticipation(): void {
    var user = {
      firstName: this.form.get('firstName')!.value,
      lastName: this.form.get('lastName')!.value,
      email: this.form.get('email')!.value,
      phone: this.form.get('phone')!.value,
      address: {
        street: this.form.get('address.street')!.value,
        postalCode: parseInt(this.form.get('address.postalCode')!.value),
        city: this.form.get('address.city')!.value
      },
      payment: {
        distribution: this.form.get('payment.distribution')!.value,
        iban: this.form.get('payment.iban')!.value
      }
    };

    var participation = {
      ticket: WinningTicket.fromString(this.form.get('ticket')!.value),
      start: this.form.get('start')!.value,
      end: this.form.get('end')!.value
    } as Participation;

    this.participationService.addParticipationWithNewUser(participation, user, (addedId, error) => {
      if (addedId) {
        this.participationService.refetch();
        this.form.reset();
        this.snackBar.open(`Teilnahme wurde registriert`, 'Schließen', snackBarConfig);
      }
      if (error) {
        this.snackBar.open(`Teilname konnte nicht registriert werden: ${addedId}`, 'Schließen', snackBarConfig);
      }
    });
  }

  public onFromNextQuarter(): void {
    this.start.setValue(startOfNextQuarter());
  }

  get firstName() { return this.form.get('firstName')!; }
  get lastName() { return this.form.get('lastName')!; }
  get ticket() { return this.form.get('ticket')!; }
  get start() { return this.form.get('start')!; }
  get end() { return this.form.get('end')!; }
  get email() { return this.form.get('email')!; }
  get phone() { return this.form.get('phone')!; }
  get street() { return this.form.get('address.street')!; }
  get city() { return this.form.get('address.city')!; }
  get postalCode() { return this.form.get('address.postalCode')!; }
  get distribution() { return this.form.get('payment.distribution')!; }
  get iban() { return this.form.get('payment.iban')!; }
}