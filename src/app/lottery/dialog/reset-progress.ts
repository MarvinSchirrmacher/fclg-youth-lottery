import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { LotteryWinner } from "src/app/common/lottery-winner"

@Component({
    selector: 'reset-progress',
    templateUrl: './reset-progress.component.html',
})
export class ResetProgressDialog {
    
    winner: LotteryWinner

    constructor(
        public dialogRef: MatDialogRef<ResetProgressDialog>,
        @Inject(MAT_DIALOG_DATA) public data: LotteryWinner) {
        this.winner = data
    }

    reset(): void {
        this.dialogRef.close(true)
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    close(): void {
        this.dialogRef.close()
    }
}