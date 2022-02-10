import { BSON } from "realm-web";

export enum Gender {
  Male = 'Herr',
  Female = 'Frau',
  Diverse = 'Divers'
}

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

export class User {
  _id?: BSON.ObjectID;
  gender: Gender;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: UserAddress;
  payment: UserPayment;

  constructor(user: Partial<User>) {
    this._id = user._id
    this.gender = user.gender!
    this.firstName = user.firstName!
    this.lastName = user.lastName!
    this.email = user.email
    this.phone = user.phone
    this.address = user.address
    this.payment = user.payment!
  }

  public static fromObject(user: User) {
    return new User(user)
  }

  public getWinnerNoun(): string {
    return this.nouns[this.gender]
  }

  public getPersonalPronoun(): string {
    return this.personalPronouns[this.gender]
  }

  public getPossessivePronoun(): string {
    return this.possessivePronouns[this.gender]
  }

  private nouns = {
    'Herr': 'Gewinner',
    'Frau': 'Gewinnerin',
    'Divers': 'Gewinner'
  }

  private personalPronouns = {
    'Herr': 'er',
    'Frau': 'sie',
    'Divers': 'es'
  }

  private possessivePronouns = {
    'Herr': 'sein',
    'Frau': 'ihr',
    'Divers': 'sein'
  }
}