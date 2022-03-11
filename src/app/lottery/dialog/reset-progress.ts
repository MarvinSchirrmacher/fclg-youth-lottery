import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Winner } from "src/app/common/winner"

@Component({
    selector: 'reset-progress',
    templateUrl: './reset-progress.component.html',
})
export class ResetProgressDialog {
    
    winner: Winner

    constructor(
        public dialogRef: MatDialogRef<ResetProgressDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Winner) {
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