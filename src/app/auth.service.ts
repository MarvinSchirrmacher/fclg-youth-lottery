import { Injectable } from '@angular/core';
import * as Realm from "realm-web";
import { Credentials, User } from 'realm-web';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  app: Realm.App = new Realm.App({ id: "fclg-youth-lottery-nmhhi" });
  user =  {} as Realm.User;
  loggedIn = false;
  email = "";

  public getCurrentUser() { return this.app.currentUser; }

  public isLoggedIn(): boolean { return this.loggedIn; }

  public login(email: string, password: string): Promise<string> {
    console.log('log in user ' + email);
    const credentials = Realm.Credentials.emailPassword(email, password);
    return this.loginWith(credentials);
  }

  public loginAnonymously(): Promise<string> {
    console.log('log in anonymously');
    const credentials = Realm.Credentials.anonymous();
    return this.loginWith(credentials);
  }

  public async logout() {
    console.log('log out current user');
    await this.app.currentUser?.logOut();
  }

  public sendEmailCode(email: string, code: string) {
    return new Promise<string>((resolve, reject) => {
      console.log("sent code " + code + " to email " + email);
      resolve("sent email");
    });
    // let query = "http://newindigommt.com:5000?email=" + email + "&code=" + code;
    // return this.http.get(query, {responseType: "text"}).toPromise();
  }

  public register(email: string, password: string): Promise<void> {
    console.log('register user ' + email);
    return this.app.emailPasswordAuth.registerUser(email, password);
  }

  public changePassword(password: string): Promise<void> {
    let emailResponse = this.getCurrentUser()!
      .functions.callFunction("getEmail", this.app.currentUser!.id);
    let passwordResetResponse = emailResponse.then(r => {
      console.log('reset password of user ' + r.email);
      this.app.emailPasswordAuth.callResetPasswordFunction(r.email, password);
    });
    return passwordResetResponse;
  }

  
  private loginWith(credentials: Credentials): Promise<string> {
    let user = this.app.logIn(credentials);
    return new Promise<string>((resolve, reject) => {
      user.then(response => {
        console.log('logged in user ' + response);
        this.user = response;
        this.loggedIn = true;
        resolve("success")
      }).catch(error => {
        console.log('failed to log in because ' + error);
        reject("Login failed");
      })
    });
  }
}
