import { Component, Inject } from "@angular/core"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { article, participantNoun } from "src/app/common/gendering"
import { User } from "src/app/common/user"


@Component({
    selector: 'delete-user',
    templateUrl: './delete-user.component.html',
})
export class DeleteUserDialog {

    firstName: string = ''
    lastName: string = ''
    the: string = ''
    noun: string = ''

    constructor(
        public dialogRef: MatDialogRef<DeleteUserDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User) {
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.the = article.get(data.gender)!
        this.noun = participantNoun.get(data.gender)!
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