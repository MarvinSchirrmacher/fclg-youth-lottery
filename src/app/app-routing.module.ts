import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from './account/change-password/change-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { LotteryComponent } from './lottery/lottery.component';
import { ParticipationComponent } from './participation/participation.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'lottery-component', component: LotteryComponent },
  { path: 'participation-component', component: ParticipationComponent },
  { path: 'settings-component', component: SettingsComponent },
  { path: 'change-password-component', component: ChangePasswordComponent },
  { path: 'login-component', component: LoginComponent },
  { path: 'register-component', component: RegisterComponent },
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
