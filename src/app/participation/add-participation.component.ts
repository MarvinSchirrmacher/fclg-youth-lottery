import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BSON } from 'realm-web'
import { snackBarConfig } from '../common/data'
import { startOfNextQuarter, startOfYear } from '../common/dates'
import { Participation } from '../common/participation'
import { Term } from '../common/term'
import { ProfitDistributionMethod, User } from '../common/user'
import { WinningTicket } from '../common/winning-ticket'
import { ParticipationService } from '../service/participation.service'
import { Gender } from '../common/gendering'


export enum AddMode {
  RegisteredUser = 'Registrierter Teilnehmer',
  NewUser = 'Neuer Teilnehmer'
}

@Component({
  selector: 'app-add-participation',
  templateUrl: './add-participation.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
})
export class AddParticipationComponent implements OnInit {

  readonly nameValidator = Validators.pattern(/^(\S+( |-)?)+$/)
  readonly phoneValidator = Validators.pattern(/^(\+\d{2}|0)( )?(\d{3})( )?(\d{4,9})$/)
  readonly ibanValidator = Validators.pattern(/^([A-Za-z]{2})(\d{2})(\d{18})$/)

  AddMode = AddMode

  form = {} as FormGroup
  registeredUsers = [] as User[]
  freeTickets = [] as WinningTicket[]
  addModes: string[] = Object.values(AddMode)
  genders: string[] = Object.values(Gender)
  profitDistributionMethods: string[] = Object.values(ProfitDistributionMethod)

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      addMode: [AddMode.RegisteredUser, [Validators.required]],
      user: ['', Validators.required],
      gender: [''],
      firstName: ['', this.nameValidator],
      lastName: ['', this.nameValidator],
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
        distribution: [ProfitDistributionMethod.BankTransfer],
        iban: ['', [this.ibanValidator]],
        paypal: ['', [Validators.email]]
      })
    })

    this.addMode.valueChanges
      .subscribe(mode => this.resetRequiredFields(mode))
    this.participationService.queryUsers()
      .subscribe(users => this.registeredUsers = users)
    this.participationService.observeFreeTickets()
      .subscribe(tickets => this.freeTickets = tickets)
  }

  public onAddParticipation(): void {
    console.debug('onAddParticipation')
    var participation = {
      ticket: WinningTicket.fromString(this.ticket.value),
      term: Term.fromObject({ start: this.start.value, end: this.end.value })
    } as Participation

    if (this.addMode.value == AddMode.NewUser) {
      var user = this.createUserFromFields()
      this.participationService.addParticipationWithNewUser(participation, user, this.onAdded)
    } else if (this.addMode.value == AddMode.RegisteredUser) {
      participation.user = this.registeredUser.value
      this.participationService.addParticipation(participation, this.onAdded)
    }
  }

  public onFromNextQuarter(): void {
    this.start.setValue(startOfNextQuarter())
  }

  public onFromStartOfYear(): void {
    this.start.setValue(startOfYear())
  }

  private createUserFromFields(): User {
    console.debug('createUserFromFields')
    return new User({
      gender: this.gender.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      email: this.email.value,
      phone: this.phone.value,
      address: {
        street: this.street.value,
        postalCode: parseInt(this.postalCode.value),
        city: this.city.value
      },
      payment: {
        distribution: this.distribution.value,
        iban: this.iban.value
      }
    })
  }

  private onAdded = {
    next: (id: any) => {
      this.participationService.refetch()
      this.resetAllFieldsButAddMode();
      this.snackBar.open(`Teilnahme wurde registriert`, 'Schließen', snackBarConfig)
    },
    error: (error: any) => {
      this.snackBar.open(`Teilname konnte nicht registriert werden: ${error}`, 'Schließen', snackBarConfig)
    }
  }

  private resetAllFieldsButAddMode(): void {
    var mode = this.addMode.value
    this.form.reset()
    this.addMode.setValue(mode)
  }

  private resetRequiredFields(addMode: AddMode): void {
    console.debug('resetRequiredFields')
    if (addMode == AddMode.RegisteredUser) {
      console.debug('AddMode.RegisteredUser')
      this.requiredFieldsForNewUser.forEach(f => this.removeValidatorAndUpdate(f))
      this.requiredFieldsForRegisteredUser.forEach(f => this.addValidatorAndUpdate(f))
    } else if (addMode == AddMode.NewUser) {
      console.debug('AddMode.NewUser')
      this.requiredFieldsForNewUser.forEach(f => this.addValidatorAndUpdate(f))
      this.requiredFieldsForRegisteredUser.forEach(f => this.removeValidatorAndUpdate(f))
    }
  }

  private addValidatorAndUpdate(control: AbstractControl): void {
    control.addValidators(Validators.required)
    control.updateValueAndValidity()
  }

  private removeValidatorAndUpdate(control: AbstractControl): void {
    control.removeValidators(Validators.required)
    control.updateValueAndValidity()
  }

  get addMode() { return this.form.get('addMode')! }
  get registeredUser() { return this.form.get('user')! }
  get gender() { return this.form.get('gender')! }
  get firstName() { return this.form.get('firstName')! }
  get lastName() { return this.form.get('lastName')! }
  get ticket() { return this.form.get('ticket')! }
  get start() { return this.form.get('start')! }
  get end() { return this.form.get('end')! }
  get email() { return this.form.get('email')! }
  get phone() { return this.form.get('phone')! }
  get street() { return this.form.get('address.street')! }
  get city() { return this.form.get('address.city')! }
  get postalCode() { return this.form.get('address.postalCode')! }
  get distribution() { return this.form.get('payment.distribution')! }
  get iban() { return this.form.get('payment.iban')! }

  get requiredFieldsForRegisteredUser(): AbstractControl[] {
    return [
      this.registeredUser
    ]
  }

  get requiredFieldsForNewUser(): AbstractControl[] {
    return [
      this.gender,
      this.firstName,
      this.lastName,
      this.distribution,
      this.iban
    ]
  }
}