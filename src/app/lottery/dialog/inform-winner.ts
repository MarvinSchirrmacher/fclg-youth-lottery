import { Component, Inject } from "@angular/core"
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MAT_DATE_LOCALE } from "@angular/material/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Gender, perPronoun, posPronounNomMas, winnerNoun } from "src/app/common/gendering"
import { Winner } from "src/app/common/winner"
import { SettingsService } from "src/app/service/settings.service"

export interface InformWinnerData {
    sendEmail: boolean
    email?: string
    reference?: string
    content?: string
}

@Component({
  selector: 'inform-winner',
  templateUrl: './inform-winner.component.html',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
})
export class InformWinnerDialog {

  Gender = Gender
  form = {} as FormGroup
  
  winner: Winner
  noun: string
  personalPronoun: string
  possessivePronoun: string

  get email(): AbstractControl {
    return this.form.get('email')!
  }

  get reference(): AbstractControl {
    return this.form.get('reference')!
  }

  get content(): AbstractControl {
    return this.form.get('content')!
  }

  constructor(
      public dialogRef: MatDialogRef<InformWinnerDialog, InformWinnerData>,
      @Inject(MAT_DIALOG_DATA) public data: Winner,
      private settings: SettingsService,
      private formBuilder: FormBuilder) {

    this.winner = data
    let g = this.winner.user.gender
    this.noun = winnerNoun(g)
    this.personalPronoun = perPronoun(g)
    this.possessivePronoun = posPronounNomMas(g)

    this.form = this.formBuilder.group({
      email: [this.winner.user.email, [Validators.email, Validators.required]],
      reference: [this.settings.emailReferenceTemplate, [Validators.required]],
      content: [this.buildMailContent(this.winner), [Validators.required]]
    })
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  sendMail(): void {
    this.dialogRef.close({
      sendEmail: true,
      email: this.email.value,
      reference: this.reference.value,
      content: this.content.value
    })
  }

  doNotInform(): void {
    this.dialogRef.close({
      sendEmail: false
    })
  }

  close(): void {
    this.dialogRef.close()
  }

  private buildMailContent(winner: Winner): string {
    return this.settings.emailContentTemplate
      .replace('${firstName}', winner.user.firstName)
      .replace('${lastName}', winner.user.lastName)
      .replace('${date}', winner.draw.date.toLocaleDateString())
      .replace('${ticket}', winner.tickets[0].toString())
      .replace('${draw}', winner.draw.numbers.join(", "))
  }
}