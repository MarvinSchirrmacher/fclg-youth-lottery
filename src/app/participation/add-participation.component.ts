import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { snackBarConfig } from '../common/common'
import { startOfNextQuarter, startOfYear } from '../common/dates'
import { Participation } from '../common/participation'
import { Term } from '../common/term'
import { User } from '../common/user'
import { WinningTicket } from '../common/winning-ticket'
import { ParticipationService } from '../service/participation.service'


export enum AddMode {
  RegisteredUser = 'Registrierter Teilnehmer',
  NewUser = 'Neuer Teilnehmer'
}

@Component({
  selector: 'app-add-participation',
  templateUrl: './add-participation.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddParticipationComponent implements OnInit {

  AddMode = AddMode

  form = {} as FormGroup
  registeredUsers = [] as User[]
  freeTickets = [] as WinningTicket[]
  addModes: string[] = Object.values(AddMode)

  get addMode() { return this.form.get('addMode')! }
  get registeredUser() { return this.form.get('user')! }
  get newUser() { return this.form.get('newUser')! }
  get ticket() { return this.form.get('ticket')! }
  get start() { return this.form.get('start')! }
  get end() { return this.form.get('end')! }

  get requiredFieldsForRegisteredUser(): AbstractControl[] {
    return [ this.registeredUser ]
  }

  get requiredFieldsForNewUser(): AbstractControl[] {
    return [ this.newUser ]
  }

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      addMode: [AddMode.RegisteredUser, [Validators.required]],
      user: ['', Validators.required],
      newUser: [],
      ticket: ['', Validators.required],
      start: ['', Validators.required],
      end: []
    })

    this.addMode.valueChanges
      .subscribe(mode => this.resetRequiredFields(mode))
    this.participationService.queryUsers()
      .subscribe(users => this.registeredUsers = users)
    this.participationService.observeFreeTickets()
      .subscribe(tickets => this.freeTickets = tickets)
  }

  onAddParticipation(): void {
    var participation = {
      ticket: WinningTicket.fromString(this.ticket.value),
      term: Term.fromObject({ start: this.start.value, end: this.end.value })
    } as Participation

    if (this.addMode.value == AddMode.NewUser) {
      var user = this.newUser.value
      this.participationService.addParticipationWithNewUser(participation, user, this.onAdded)
    } else if (this.addMode.value == AddMode.RegisteredUser) {
      participation.user = this.registeredUser.value
      this.participationService.addParticipation(participation, this.onAdded)
    }
  }

  onFromNextQuarter(): void {
    this.start.setValue(startOfNextQuarter())
  }

  onFromStartOfYear(): void {
    this.start.setValue(startOfYear())
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
    Object.keys(this.form.controls)
      .map(key => this.form.controls[key])
      .forEach(control => {
        control.setErrors(null)
        control.markAsPristine()
        control.markAsUntouched()
      });
    this.addMode.setValue(mode)
  }

  private resetRequiredFields(addMode: AddMode): void {
    if (addMode == AddMode.RegisteredUser) {
      this.removeValidatorAndUpdate(this.newUser)
      this.addValidatorAndUpdate(this.registeredUser)
    } else if (addMode == AddMode.NewUser) {
      this.addValidatorAndUpdate(this.newUser)
      this.removeValidatorAndUpdate(this.registeredUser)
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
}