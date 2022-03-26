import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { descending, snackBarConfig } from '../common/common';
import { LotteryService } from '../service/lottery.service';
import { SettingsService } from '../service/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  years: number[] = []
  form = {} as FormGroup
  get year() { return this.form.get('year')! }
  
  constructor(
    private settings: SettingsService,
    private lottery: LotteryService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      year: [null, [Validators.required]]
    })
    this.lottery.readYears()
      .subscribe(years => {
        this.years = years.sort(descending)
        this.year.setValue(years.includes(this.settings.year) ? this.settings.year : years[0])
      })
  }

  save(): void {
    this.settings.year = this.year.value
    // this.settings.save()
    this.snackBar.open('Einstellungen wurden gespeichert', 'Ok', snackBarConfig)
  }
}
