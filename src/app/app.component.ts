import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FCLG Jugendlotto';
  noUser = true;

  constructor(
    public authService: AuthService,
    private router: Router) {
  }

  onLogout() {
    this.authService
      .logout()
      .then(r => this.router.navigate(['login-component']));
  }
}
