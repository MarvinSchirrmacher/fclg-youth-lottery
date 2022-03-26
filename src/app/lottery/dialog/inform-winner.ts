import { Component, Inject } from "@angular/core"
import { FormGroup, Validators } from "@angular/forms"
import { MAT_DATE_LOCALE } from "@angular/material/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Gender, perPronoun, posPronounNomMas, winnerNoun } from "src/app/common/gendering"
import { Winner } from "src/app/common/winner"

@Component({
    selector: 'inform-winner',
    templateUrl: './inform-winner.component.html',
    providers: [
      { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    ]
})
export class InformWinnerDialog {

    Gender = Gender
    
    winner: Winner
    noun: string
    personalPronoun: string
    possessivePronoun: string
    
    formBuilder: any
    nameValidator: any
    phoneValidator: any
    ibanValidator: any

    constructor(
        public dialogRef: MatDialogRef<InformWinnerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Winner) {
      this.winner = data
      let g = this.winner.user.gender
      this.noun = winnerNoun(g)
      this.personalPronoun = perPronoun(g)
      this.possessivePronoun = posPronounNomMas(g)
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