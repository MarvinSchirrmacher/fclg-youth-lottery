import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FCLG Jugendlotto';
  noUser = true;

  constructor(
    public auth: AuthService,
    private router: Router) {
  }

  onLogout() {
    this.auth
      .logout()
      .then(r => this.router.navigate(['login-component']));
  }
}
