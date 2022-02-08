import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminComponent } from './admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LotteryComponent } from './lottery/lottery.component';
import { ParticipationComponent } from './participation/participation.component';
import { RegisterComponent } from './register/register.component';
import { GraphQLModule } from './graphql.module';
import { MaterialModule } from './material.module';
import { QRCodeModule } from 'angular2-qrcode';
import { AddParticipationComponent } from './participation/add-participation.component';
import { EndPariticipationDialog } from './participation/dialog/end-participation.component';
import { DeletePariticipationDialog } from './participation/dialog/delete-participation.component';
import { PariticipationDetailsDialog } from './participation/dialog/participation-details.component';
import { InformWinnerDialog } from './lottery/dialog/inform-winner';
import { PayWinnerDialog } from './lottery/dialog/pay-winner';


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    LotteryComponent,
    ParticipationComponent,
    AddParticipationComponent,
    PariticipationDetailsDialog,
    EndPariticipationDialog,
    DeletePariticipationDialog,
    InformWinnerDialog,
    PayWinnerDialog
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    GraphQLModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    QRCodeModule
  ],
  entryComponents: [
    EndPariticipationDialog
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
