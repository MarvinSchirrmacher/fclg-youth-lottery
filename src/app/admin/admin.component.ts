import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ParticipationService } from '../service/participation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {

  public ready: boolean = false

  constructor(
    private auth: AuthService,
    private router: Router,
    private participationService: ParticipationService) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.participationService.init()
      this.ready = true
    } else {
      console.debug('not logged in, route to login page')
      this.router.navigate(['login-component'])
    }
  }
}
