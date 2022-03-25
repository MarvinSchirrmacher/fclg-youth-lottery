import { Injectable } from '@angular/core'
import * as Realm from "realm-web"
import { REALM_APP_ID } from '../common/mongodb'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  app: Realm.App = new Realm.App({ id: REALM_APP_ID })

  get user(): Realm.User | null { return this.app.currentUser }

  get accessToken(): string | null {
    if (!this.user)
      return null

    return this.user.accessToken
  }

  get isLoggedIn(): boolean { return this.user ? this.user.isLoggedIn : false }

  refreshAccessToken(): Promise<void> {
    return this.user!.refreshAccessToken()
  }

  getAccessToken(): Promise<string | null> {
    console.debug(`get access token`)
    if (this.user == null)
      return new Promise(() => null)
    
    if (this.user.accessToken)
      return new Promise(() => this.user!.accessToken)

    return this.user.refreshAccessToken()
      .then(() => {
        console.debug('refreshed access token')
        return this.user!.accessToken
      })
  }

  login(email: string, password: string): Promise<Realm.User> {
    console.debug(`log in user ${email}`)
    const credentials = Realm.Credentials.emailPassword(email, password)
    return this.app.logIn(credentials)
  }

  loginAnonymously(): Promise<Realm.User> {
    console.debug('log in anonymously')
    const credentials = Realm.Credentials.anonymous()
    return this.app.logIn(credentials)
  }

  async logout() {
    console.debug('log out current user')
    await this.app.currentUser?.logOut()
  }

  sendEmailCode(email: string, code: string) {
    return new Promise<string>((resolve, reject) => {
      console.debug(`sent code ${code} to email ${email}`)
      resolve('sent email')
    })
    // let query = "http://newindigommt.com:5000?email=" + email + "&code=" + code
    // return this.http.get(query, {responseType: "text"}).toPromise()
  }

  register(email: string, password: string): Promise<void> {
    console.debug(`register user ${email}`)
    return this.app.emailPasswordAuth.registerUser(email, password)
  }

  changePassword(password: string): Promise<void> {
    let emailResponse = this.user!
      .functions.callFunction('getEmail', this.app.currentUser!.id)
    let passwordResetResponse = emailResponse.then(r => {
      console.debug(`reset password of user ${r.email}`)
      this.app.emailPasswordAuth.callResetPasswordFunction(r.email, password)
    })
    return passwordResetResponse
  }
}
