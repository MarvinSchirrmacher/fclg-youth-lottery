import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QRCodeModule } from 'angular2-qrcode';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChangePasswordComponent } from './account/change-password/change-password.component';
import { GraphQLModule } from './graphql.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './account/login/login.component';
import { DeleteWinnerDialog } from './lottery/dialog/delete-winner.component';
import { InformWinnerDialog } from './lottery/dialog/inform-winner';
import { PayWinnerDialog } from './lottery/dialog/pay-winner';
import { ResetProgressDialog } from './lottery/dialog/reset-progress';
import { LotteryComponent } from './lottery/lottery.component';
import { MaterialModule } from './material.module';
import { AddParticipationComponent } from './participation/add-participation.component';
import { DeletePariticipationDialog } from './participation/dialog/delete-participation.component';
import { DeleteUserDialog } from './participation/dialog/delete-user.component';
import { EditUserDialog } from './participation/dialog/edit-user.component';
import { EndPariticipationDialog } from './participation/dialog/end-participation.component';
import { PariticipationDetailsDialog } from './participation/dialog/participation-details.component';
import { ParticipationComponent } from './participation/participation.component';
import { RegisterComponent } from './account/register/register.component';
import './common/strings'
import { UserFormComponent } from './participation/form/user-form.component';
import { SettingsComponent } from './settings/settings.component';
import { UnsavedChangesDialog } from './settings/dialog/unsaved-changes.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    SettingsComponent,
    UserFormComponent,
    LotteryComponent,
    ParticipationComponent,
    AddParticipationComponent,
    PariticipationDetailsDialog,
    EndPariticipationDialog,
    DeletePariticipationDialog,
    DeleteUserDialog,
    EditUserDialog,
    InformWinnerDialog,
    PayWinnerDialog,
    DeleteWinnerDialog,
    ResetProgressDialog,
    UnsavedChangesDialog
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
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: "en-US" }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
