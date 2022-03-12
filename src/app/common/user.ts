import { BSON } from "realm-web";
import { Gender, personalPronoun, possessivePronoun, winnerNoun } from "./gendering";


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

  public static unknown() {
    return new User({
      firstName: '',
      lastName: 'Unbekannt',
      payment: {
        distribution: ProfitDistributionMethod.Cash,
        iban: ''
      }
    })
  }
}