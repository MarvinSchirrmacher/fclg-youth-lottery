import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Draw } from "src/app/common/draw"

@Component({
    selector: 'reevaluate-draw',
    templateUrl: './reevaluate-draw.component.html',
})
export class ReEvaluateDrawDialog {
    
    draw: Draw

    constructor(
        public dialogRef: MatDialogRef<ReEvaluateDrawDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Draw) {
        this.draw = data
    }

    evaluate(): void {
        this.dialogRef.close(true)
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    close(): void {
        this.dialogRef.close()
    }
}