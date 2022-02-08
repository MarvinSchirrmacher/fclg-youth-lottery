import { MatSnackBarConfig } from "@angular/material/snack-bar";
import { BSON } from "realm-web";
import { Term } from "./term";
import { WinningTicket } from "./winning-ticket";

export interface UserAddress {
  street: string;
  city: string;
  postalCode: number;
}

export enum ProfitDistributionMethod {
  BankTransfer = 'Überweisung',
  PayPal = 'PayPal',
  Cash = 'Bar',
  Donation = 'Spende'
}

export interface UserPayment {
  distribution: ProfitDistributionMethod;
  iban: string;
  paypal?: string;
}

export interface User {
  _id?: BSON.ObjectID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: UserAddress;
  payment: UserPayment;
}

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