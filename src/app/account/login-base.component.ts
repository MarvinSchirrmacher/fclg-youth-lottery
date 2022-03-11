import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { UserCredentials } from "../common/user-credentials";

@Component({
  selector: 'app-login-base',
  template: ''
})
export abstract class LoginBaseComponent implements OnInit {

  public userCredentials = {} as UserCredentials;
  public formGroup = {} as FormGroup;
  public errorMessage = "";

  ngOnInit(): void {
    this.formGroup = this.getFormGroup();
    this.errorMessage = "";
    this.onInit();
  }

  abstract getFormGroup(): FormGroup;
  abstract onInit(): void;
}