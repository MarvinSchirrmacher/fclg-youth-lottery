import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { LoginBaseComponent } from '../common/login-base.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent extends LoginBaseComponent {

  isVerifying = false;
  sentCode: string = "";

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    super();
  }

  getFormGroup(): FormGroup {
    return this.formBuilder.group({
      email: [ this.userCredentials.email,
        { validators: [ Validators.required, Validators.email ],
          updateOn: 'blur' } ],
      password: [ this.userCredentials.password,
        { validators: [ Validators.required ],
          updateOn: 'blur' } ],
      retype: [ this.userCredentials.retype,
        { validators: [ Validators.required ],
          updateOn: 'blur' } ],
      verify: [ this.userCredentials.verify ]
    });
  }

  onInit(): void {
    this.isVerifying = false;
    this.sentCode = "";
  }

  onSubmit() {
    this.formGroup.markAllAsTouched();
    this.errorMessage = "";

    if (this.isVerifying) {
      this.submitVerification();
      return;
    } else if (!this.formGroup.valid) {
      return;
    } else if (this.password.value != this.retype.value) {
      return;
    }

    this.sendVerification();
  }

  sendVerification() {
    this.sentCode = Math.floor(Math.random() * 100000).toString();
    this.authService
      .sendEmailCode(this.email.value, this.sentCode)
      .then((data) => {})
      .catch((error) => this.errorMessage = error.statusText);
    this.isVerifying = true;
    this.errorMessage = "";
  }

  submitVerification() {
    if (this.code.value !== this.sentCode) {
      this.errorMessage = "verification code is incorrect";
      return;
    }
    
    this.authService
      .register(this.email.value, this.password.value)
      .then(r => this.authService.login(this.email.value, this.password.value))
      .then(() => {
        console.log('navigate to home page');
        this.router.navigate(['']);
      })
      .catch(e => {
        console.log('failed to register user ' + this.email + ' because ' + e);
        this.errorMessage = "registration failed because " + e;
      });
  }

  onAlreadyRegistered() {
    this.router.navigate(['login-component']);
  }

  get email() { return this.formGroup.controls['email']; }
  get password() { return this.formGroup.controls['password']; }
  get retype() { return this.formGroup.controls['retype']; }
  get code() { return this.formGroup.controls['verify']; }
}

