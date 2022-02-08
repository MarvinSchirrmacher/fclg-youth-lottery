import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { LotteryWinner } from "src/app/common/lottery-winner"
import { GiroCodeService } from "src/app/service/girocode.service"

@Component({
  selector: 'pay-winner',
  templateUrl: './pay-winner.component.html',
})
export class PayWinnerDialog {
  firstName: string
  lastName: string
  tickets: string
  date: Date
  profit: number
  giroCode: string

  constructor(
    public dialogRef: MatDialogRef<PayWinnerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LotteryWinner,
    private giroCodeService: GiroCodeService) {
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
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  paid(): void {
    this.dialogRef.close(true)
  }

  close(): void {
    this.dialogRef.close()
  }
}