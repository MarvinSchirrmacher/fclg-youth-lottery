import { BSON } from "realm-web";
import { WinningTicket } from "./winning-ticket";

export interface UserAddress {
  street?: string;
  city?: string;
  postalCode?: number;
}

export enum ModeOfPayment {
  BankTransfer,
  PayPal,
  Cash,
  Donation,
  None
}

export interface UserPayment {
  mode: ModeOfPayment;
  iban?: string;
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
  start: Date;
  end?: Date;
}