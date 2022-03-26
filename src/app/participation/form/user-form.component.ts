import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy } from "@angular/core"
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from "@angular/forms"
import { Subscription } from "rxjs"
import { Gender, formsOfAddress } from "src/app/common/gendering"
import { ProfitDistributionMethod, User } from "src/app/common/user"

export interface UserFormValues {
	user: User
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UserFormComponent),
      multi: true,
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements ControlValueAccessor, OnDestroy {
	form: FormGroup
  subscriptions: Subscription[] = []
  
  genders: Gender[] = Object.values(Gender)
  formsOfAddress = formsOfAddress
  profitDistributionMethods: string[] = Object.values(ProfitDistributionMethod)
	
  onChange: any = () => {}
  onTouched: any = () => {}

  get gender() { return this.form.get('gender')! }
  get firstName() { return this.form.get('firstName')! }
  get lastName() { return this.form.get('lastName')! }
  get email() { return this.form.get('email')! }
  get phone() { return this.form.get('phone')! }
  get street() { return this.form.get('address.street')! }
  get city() { return this.form.get('address.city')! }
  get postalCode() { return this.form.get('address.postalCode')! }
  get distribution() { return this.form.get('payment.distribution')! }
  get iban() { return this.form.get('payment.iban')! }

  get value(): User {
    console.debug('get user form value')
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

  set value(user: User) {
    console.debug('set user form value')
    this.gender.setValue(user.gender)
    this.firstName.setValue(user.firstName)
    this.lastName.setValue(user.lastName)
    this.email.setValue(user.email)
    this.phone.setValue(user.phone)
    this.street.setValue(user.address?.street)
    this.postalCode.setValue(user.address?.postalCode)
    this.city.setValue(user.address?.city)
    this.distribution.setValue(user.payment.distribution)
    this.iban.setValue(user.payment.iban)
  
    this.onChange(user)
    this.onTouched()
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

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      gender: ['', Validators.required],
      firstName: ['', [Validators.required, this.nameValidator]],
      lastName: ['', [Validators.required, this.nameValidator]],
      email: ['', [Validators.email]],
      phone: ['', [this.phoneValidator]],
      address: this.formBuilder.group({
        street: [''],
        city: [''],
        postalCode: ['']
      }),
      payment: this.formBuilder.group({
        distribution: [ProfitDistributionMethod.BankTransfer, Validators.required],
        iban: ['', [Validators.required, this.ibanValidator]],
        paypal: ['', [Validators.email]]
      })
    })

    this.subscriptions.push(
      this.form.valueChanges.subscribe(value => {
        console.debug(`new user control value changed ${JSON.stringify(value)}`)
        this.onChange(value)
        this.onTouched()
      })
    )
  }

	writeValue(value: User): void {
    console.debug(`write new user control value ${JSON.stringify(value)}`)
    if (value)
      this.value = value

    if (value === null)
      this.form.reset()
	}

	registerOnChange(fn: any): void {
    this.onChange = fn
	}

	registerOnTouched(fn: any): void {
    this.onTouched = fn
	}

	ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
	}
  
  validate(baseControl: FormControl) {
    const validator =  baseControl.validator ? baseControl.validator({} as AbstractControl) : undefined
    const validate = validator && validator['required']
    if (validate)
      return this.form.valid ? null : { newUser: { valid: false, } };
    return null
  }

  readonly nameValidator = Validators.pattern(/^(\S+( |-)?)+$/)
  readonly phoneValidator = Validators.pattern(/^(\+\d{2}|0)( )?(\d{3})( )?(\d{4,9})$/)
  readonly ibanValidator = Validators.pattern(/^([A-Za-z]{2})(\d{2})(\d{18})$/)
}