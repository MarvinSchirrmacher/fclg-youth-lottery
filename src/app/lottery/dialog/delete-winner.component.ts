import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { article, participantNoun } from "src/app/common/gendering"
import { Winner } from "src/app/common/winner"


@Component({
  selector: 'delete-winner',
  templateUrl: './delete-winner.component.html',
})
export class DeleteWinnerDialog {

  firstName: string = ''
  lastName: string = ''
  the: string = ''
  noun: string = ''

  constructor(
    public dialogRef: MatDialogRef<DeleteWinnerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Winner) {
    this.firstName = data.user.firstName
    this.lastName = data.user.lastName
    this.the = article(data.user.gender)
    this.noun = participantNoun(data.user.gender)
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  yes(): void {
    this.dialogRef.close(true)
  }

  close(): void {
    this.dialogRef.close()
  }
}