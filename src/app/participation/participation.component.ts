import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { gql } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { Participation, ParticipationService } from '../participation.service';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  styleUrls: ['./participation.component.css']
})
export class ParticipationComponent implements OnInit {

  addForm = {} as FormGroup;
  participation = {} as Participation;
  participations = {} as Observable<Participation[]>;
  displayedColumns = [] as string[];
  loading = true;
  error: any;

  constructor(private formBuilder: FormBuilder,
              private participationService: ParticipationService,
              private apollo: Apollo) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      firstName: [this.participation.firstName, Validators.required]
    })
    this.displayedColumns = this.participationService.getFieldLabels();
    this.apollo
      .watchQuery({query: gql`{
        participations {
          firstName,
          lastName,
          number,
          start,
          end
        }}`})
      .valueChanges.subscribe((result: any) => {
        this.participations = result?.data?.participations;
        this.loading = result.loading;
        this.error = result.error;
      });
  }

  onRowClicked(row: any): void {
    console.log('Row clicked was ' + row);
  }

  onAddParticipation(): void {
    console.log('add participation for ' + this.firstName.value);
    this.participationService.addParticipation(this.firstName.value);
    this.addForm.reset();
  }

  onRemoveParticipation(index: number) {
    this.participationService.removeParticipation(index);
  }

  onUploadParticipations() {
    console.log('upload participations');
  }

  onDownloadParticipations() {
    console.log('download participations');
  }

  get firstName() { return this.addForm.controls['firstName']; }

}
