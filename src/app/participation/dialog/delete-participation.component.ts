import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Participation } from "../../common/data";
import { WinningTicket } from "../../common/winning-ticket";

@Component({
    selector: 'delete-participation',
    templateUrl: './delete-participation.component.html',
})
export class DeletePariticipationDialog {

    firstName: string = "";
    lastName: string = "";
    ticket: string = "";

    constructor(
        public dialogRef: MatDialogRef<DeletePariticipationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: Participation) {
        this.firstName = data.user.firstName;
        this.lastName = data.user.lastName;
        this.ticket = new WinningTicket(data.ticket.list, data.ticket.number).toString();
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