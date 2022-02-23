import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MailService {

  private _address: string = ''
  private _reference: string = ''
  private _content: string = ''

  public address(value: string): MailService {
    this._address = value
    return this
  }

  public reference(value: string): MailService {
    this._reference = value
    return this
  }

  public content(value: string): MailService {
    this._content = value
    return this
  }

  public send(): Observable<any> {
    return of(`sent mail to ${this._address}`)
  }
}