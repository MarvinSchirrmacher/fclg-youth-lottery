import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginBaseComponent } from '../login-base.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent extends LoginBaseComponent {
              
  showRetype = false;
  showChangePassword = false;

  constructor(private authService: AuthService,
              private router: Router) {
    super();
  }
              
  getFormGroup(): FormGroup {
    return new FormGroup({
      email: new FormControl(this.userCredentials.email,
        { validators: [ Validators.required, Validators.email ] }),
      password: new FormControl(this.userCredentials.password,
        { validators: [ Validators.required ] })
    });
  }

  public onInit(): void {}

  public onLogin() {
    if (!this.formGroup.valid) return;
    
    this.authService
      .login(this.email.value, this.password.value)
      .then(r => {
        this.errorMessage = "";
        this.router.navigate(['']); })
      .catch(e => this.errorMessage = e);
  }

  public onRegister() {
    this.router.navigate(['register-component']);
  }

  public onLoginAnonymously() {
    this.authService
      .loginAnonymously()
      .then(r => {
        this.errorMessage = "";
        this.router.navigate(['']); })
      .catch(e => this.errorMessage = e);
  }

  get email() { return this.formGroup.controls['email']; }
  get password() { return this.formGroup.controls['password']; }
}
