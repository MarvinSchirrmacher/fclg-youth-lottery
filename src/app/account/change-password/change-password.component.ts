import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginBaseComponent } from '../login-base.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent extends LoginBaseComponent {

  constructor(private authService: AuthService,
              private router: Router) {
    super();
  }

  getFormGroup(): FormGroup {
    return new FormGroup({
      password: new FormControl(this.userCredentials.password,
        { validators: [ Validators.required ],
          updateOn: 'blur' }),
      retype: new FormControl(this.userCredentials.retype,
        { validators: [ Validators.required ],
          updateOn: 'blur' })
    });
  }

  onInit(): void {}

  onSubmit() {
    this.authService.changePassword(this.password.value)
      .then(() => {
        this.errorMessage = "";
        this.router.navigate(['']); })
      .catch(e => this.errorMessage = "failed to change password because " + e);
  }

  get password() { return this.formGroup.controls['password']; }
  get retype() { return this.formGroup.controls['retype']; }
}
