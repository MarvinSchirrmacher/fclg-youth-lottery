import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Gender } from "src/app/common/gendering"
import { Winner } from "src/app/common/winner"

@Component({
    selector: 'inform-winner',
    templateUrl: './inform-winner.component.html',
})
export class InformWinnerDialog {

    Gender = Gender
    
    winner: Winner
    noun: string
    personalPronoun: string
    possessivePronoun: string

    constructor(
        public dialogRef: MatDialogRef<InformWinnerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Winner) {
        this.winner = data
        this.noun = this.winner.user.getWinnerNoun()
        this.personalPronoun = this.winner.user.getPersonalPronoun()
        this.possessivePronoun = this.winner.user.getPossessivePronoun()
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    sendMail(): void {
        // TODO: send mail to winner
        this.dialogRef.close(true)
    }

    doNotInform(): void {
        this.dialogRef.close(false)
    }

    close(): void {
        this.dialogRef.close()
    }
}