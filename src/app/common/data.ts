import { MatSnackBarConfig } from "@angular/material/snack-bar";
import { BSON } from "realm-web";
import { Term } from "./term";
import { User } from "./user";
import { WinningTicket } from "./winning-ticket";

export interface Participation {
  _id?: BSON.ObjectID;
  user: User;
  ticket: WinningTicket;
  term: Term;
}

export var snackBarConfig = {
  duration: 5000,
  verticalPosition: 'bottom',
  panelClass: ['mat-primary'],
} as MatSnackBarConfig; 