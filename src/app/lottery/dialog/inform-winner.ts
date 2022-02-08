import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LotteryWinner } from "src/app/common/lottery-winner";

@Component({
    selector: 'inform-winner',
    templateUrl: './inform-winner.component.html',
})
export class InformWinnerDialog {

    firstName: string;
    lastName: string;
    date: Date;

    constructor(
        public dialogRef: MatDialogRef<InformWinnerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: LotteryWinner) {
        this.firstName = data.user.firstName;
        this.lastName = data.user.lastName;
        this.date = data.draw.date;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    sendMail(): void {
        this.dialogRef.close(true);
    }

    close(): void {
        this.dialogRef.close();
    }
}