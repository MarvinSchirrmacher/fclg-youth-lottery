import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
    selector: 'unsaved-changes',
    templateUrl: './unsaved-changes.component.html',
})
export class UnsavedChangesDialog {

    constructor(
        public dialogRef: MatDialogRef<UnsavedChangesDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    save(): void {
        this.dialogRef.close(true)
    }

    reject(): void {
        this.dialogRef.close(false)
    }
}