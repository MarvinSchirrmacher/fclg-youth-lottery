import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Participation } from "../../common/data";
import { WinningTicket } from "../../common/winning-ticket";
import { ParticipationEnd } from "../../service/participation.service";

@Component({
    selector: 'end-participation',
    templateUrl: './end-participation.component.html',
})
export class EndPariticipationDialog {

    firstName: string = "";
    lastName: string = "";
    ticket: string = "";

    constructor(
        public dialogRef: MatDialogRef<EndPariticipationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Participation) {
        this.firstName = data.user.firstName;
        this.lastName = data.user.lastName;
        this.ticket = new WinningTicket(data.ticket.list, data.ticket.number).toString();
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