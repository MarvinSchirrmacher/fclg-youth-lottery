import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Participation } from "src/app/common/participation";

@Component({
    selector: 'delete-participation',
    templateUrl: './delete-participation.component.html',
})
export class DeletePariticipationDialog {

    participations: Participation[];

    constructor(
        public dialogRef: MatDialogRef<DeletePariticipationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Participation[]) {
        this.participations = data
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    yes(): void {
        this.dialogRef.close(true);
    }

    close(): void {
        this.dialogRef.close();
    }
}