import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Participation } from "../../common/data";

@Component({
    selector: 'participation-details',
    templateUrl: './participation-details.component.html',
})
export class PariticipationDetailsDialog {

    participation = {} as Participation;

    constructor(
        public dialogRef: MatDialogRef<PariticipationDetailsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Participation) {
        this.participation = data;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    close(): void {
        this.dialogRef.close();
    }
}