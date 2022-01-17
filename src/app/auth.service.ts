import { Injectable } from '@angular/core';
import * as Realm from "realm-web";
import { Credentials } from 'realm-web';
import { REALM_APP_ID } from './common/mongodb';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  app: Realm.App = new Realm.App({ id: REALM_APP_ID });
  aquireToken = new Promise<void>((r, j) => {});

  get user(): Realm.User | null { return this.app.currentUser; }

  get accessToken(): string | null {
    var token = this.user ? this.user.accessToken : '';
    console.debug(`current access token ${token}`);
    return token;
  }

  get isLoggedIn(): boolean { return this.user ? this.user.isLoggedIn : false; }

  public login(email: string, password: string): Promise<string> {
    console.debug(`log in user ${email}`);
    const credentials = Realm.Credentials.emailPassword(email, password);
    return this.loginWith(credentials);
  }

  public loginAnonymously(): Promise<string> {
    console.debug('log in anonymously');
    const credentials = Realm.Credentials.anonymous();
    return this.loginWith(credentials);
  }

  public async logout() {
    console.debug('log out current user');
    await this.app.currentUser?.logOut();
  }

  public sendEmailCode(email: string, code: string) {
    return new Promise<string>((resolve, reject) => {
      console.debug(`sent code ${code} to email ${email}`);
      resolve('sent email');
    });
    // let query = "http://newindigommt.com:5000?email=" + email + "&code=" + code;
    // return this.http.get(query, {responseType: "text"}).toPromise();
  }

  public register(email: string, password: string): Promise<void> {
    console.debug(`register user ${email}`);
    return this.app.emailPasswordAuth.registerUser(email, password);
  }

  public changePassword(password: string): Promise<void> {
    let emailResponse = this.user!
      .functions.callFunction('getEmail', this.app.currentUser!.id);
    let passwordResetResponse = emailResponse.then(r => {
      console.debug(`reset password of user ${r.email}`);
      this.app.emailPasswordAuth.callResetPasswordFunction(r.email, password);
    });
    return passwordResetResponse;
  }

  private loginWith(credentials: Credentials): Promise<string> {
    let userPromise = this.app.logIn(credentials);
    return new Promise<string>((resolve, reject) => {
      userPromise.then(user => {
        console.debug(`logged in user with id ${user.id}`);
        resolve("success");
      }).catch(error => {
        console.debug(`failed to log in because ${error}`);
        reject("failure");
      })
    });
  }
}
