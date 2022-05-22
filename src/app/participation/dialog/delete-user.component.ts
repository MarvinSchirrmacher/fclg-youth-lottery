import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { User } from "src/app/common/user"


@Component({
    selector: 'delete-user',
    templateUrl: './delete-user.component.html',
})
export class DeleteUserDialog {

    users: User[] = []

    constructor(
        public dialogRef: MatDialogRef<DeleteUserDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User[]) {
        this.users = data
    }

    onNoClick(): void {
        this.dialogRef.close()
    }

    yes(): void {
        this.dialogRef.close(true)
    }

    close(): void {
        this.dialogRef.close()
    }
}