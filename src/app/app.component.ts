import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { QuerySubscriptionService } from './service/subscription.service';

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
    private router: Router,
    private subscription: QuerySubscriptionService) {
      this.router.events.subscribe(event => {
        if (event instanceof ActivationEnd)
          this.subscription.unsubscribeAll()
      })
  }

  onLogout() {
    this.auth
      .logout()
      .then(() => this.router.navigate(['login-component']));
  }
}
