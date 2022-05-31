import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Participation } from "src/app/common/participation";
import { ParticipationEnd } from "../../service/participation.service";

@Component({
    selector: 'end-participation',
    templateUrl: './end-participation.component.html',
})
export class EndPariticipationDialog {
    
    participations: Participation[];

    constructor(
        public dialogRef: MatDialogRef<EndPariticipationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Participation[]) {
        this.participations = data
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    endToday(): void {
        this.dialogRef.close(ParticipationEnd.Today);
    }

    endAtEndOfQuarter(): void {
        this.dialogRef.close(ParticipationEnd.EndOfQuarter);
    }

    endAtEndOfYear(): void {
        this.dialogRef.close(ParticipationEnd.EndOfYear);
    }

    close(): void {
        this.dialogRef.close();
    }
}