import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { descending, snackBarConfig } from '../common/common';
import { LotteryService } from '../service/lottery.service';
import { SettingsService } from '../service/settings.service';
import { UnsavedChangesDialog } from './dialog/unsaved-changes.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {

  years: number[] = []
  form = {} as FormGroup
  saved: boolean = true
  initialized: boolean = false
  get year() { return this.form.get('year')! }
  
  constructor(
    private settings: SettingsService,
    private lottery: LotteryService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      year: [null, [Validators.required]]
    })
    this.form.valueChanges
      .subscribe(result => {
        if (this.initialized)
          this.saved = false
        else
          this.initialized = true
      })
    this.lottery.readYears()
      .subscribe(years => {
        this.years = years.sort(descending)
        this.year.setValue(years.includes(this.settings.year) ? this.settings.year : years[0])
      })
  }

  ngOnDestroy(): void {
    if (this.saved)
      return

    this.dialog
      .open(UnsavedChangesDialog, { data: undefined, panelClass: 'w-600px' })
      .afterClosed()
      .subscribe(save => {
        if (save) this.save()
      })
  }

  save(): void {
    this.settings.year = this.year.value
    // this.settings.save()
    this.saved = true
    this.snackBar.open('Einstellungen wurden gespeichert', 'Ok', snackBarConfig)
  }
}
