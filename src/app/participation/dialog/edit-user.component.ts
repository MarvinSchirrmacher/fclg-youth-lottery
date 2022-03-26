import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { User } from "src/app/common/user";

@Component({
    selector: 'edit-user',
    templateUrl: './edit-user.component.html',
})
export class EditUserDialog {

    firstName: string = "";
    lastName: string = "";
    ticket: string = "";
    form: FormGroup;

    get user() { return this.form.get('user')! }

    constructor(
            public dialogRef: MatDialogRef<EditUserDialog>,
            @Inject(MAT_DIALOG_DATA) public data: User,
            private formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            user: [data, Validators.required],
        })
    }

    onNoClick(): void {
        this.dialogRef.close(undefined);
    }

    save(): void {
        this.dialogRef.close(User.fromObject(this.user.value));
    }

    close(): void {
        this.dialogRef.close(undefined);
    }
}