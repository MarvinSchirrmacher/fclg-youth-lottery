import { Component, Inject } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Winner } from "src/app/common/winner"
import { GiroCodeService } from "src/app/service/girocode.service"

@Component({
  selector: 'pay-winner',
  templateUrl: './pay-winner.component.html',
})
export class PayWinnerDialog {
  form = {} as FormGroup
  firstName: string
  lastName: string
  tickets: string
  date: Date
  profit: number
  giroCode: string

  get paidOn() { return this.form.get('paidOn')! }

  constructor(
      public dialogRef: MatDialogRef<PayWinnerDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Winner,
      private giroCodeService: GiroCodeService,
      private formBuilder: FormBuilder) {

    this.firstName = data.user.firstName
    this.lastName = data.user.lastName
    this.tickets = data.tickets.map(t => t.toString).join(', ')
    this.date = data.draw.date
    this.profit = data.profit
    this.giroCode = giroCodeService.createQrCodeData({
      name: `${data.user.firstName} ${data.user.lastName}`,
      iban: data.user.payment.iban,
      amount: data.profit,
      purpose: 'FCLG Jugendlotto Gewinn'
    })

    this.form = this.formBuilder.group({
      paidOn: [new Date(), Validators.required]
    })
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  paid(): void {
    if (this.form.valid)
      this.dialogRef.close(this.paidOn.value)
  }

  close(): void {
    this.dialogRef.close()
  }
}