import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
  get mailReferenceTemplate() { return this.form.get('mailTemplate.reference')! }
  get mailContentTemplate() { return this.form.get('mailTemplate.content')! }
  
  constructor(
      private settings: SettingsService,
      private lottery: LotteryService,
      private formBuilder: FormBuilder,
      private dialog: MatDialog,
      private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      year: [null, [Validators.required]],
      mailTemplate: this.formBuilder.group({
        reference: [],
        content: []
      })
    })

    this.form.valueChanges
      .subscribe(result => {
        if (this.initialized)
          this.saved = false
        else
          this.initialized = true
      })
    
    this.lottery.readYears()
      .subscribe({
        next: years => {
          this.years = years.sort(descending)
          this.year.setValue(years.includes(this.settings.settings.year) ? this.settings.settings.year : years[0])
        },
        error: error => {
          this.years = [this.settings.settings.year]
          this.year.setValue(this.settings.settings.year)
        }
      })

    this.mailReferenceTemplate.setValue(this.settings.settings.emailTemplate.reference)
    this.mailContentTemplate.setValue(this.settings.settings.emailTemplate.content)
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
    this.settings.settings.year = this.year.value
    this.settings.settings.emailTemplate.reference = this.mailReferenceTemplate.value
    this.settings.settings.emailTemplate.content = this.mailContentTemplate.value
    this.settings.save()
    this.saved = true
    this.snackBar.open('Alle Einstellungen wurden gespeichert', 'Ok', snackBarConfig)
  }

  reset(): void {
    this.settings.reset()
    this.setAll()
    this.snackBar.open('Alle Einstellungen wurden zurückgesetzt', 'Ok', snackBarConfig)
  }

  setAll(): void {
    this.year.setValue(this.settings.settings.year)
    this.mailReferenceTemplate.setValue(this.settings.settings.emailTemplate.reference)
    this.mailContentTemplate.setValue(this.settings.settings.emailTemplate.content)
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.debug(JSON.stringify(event.key))
  }
}
