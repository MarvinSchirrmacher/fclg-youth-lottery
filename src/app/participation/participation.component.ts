import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { BSON } from 'realm-web';
import { Participation, ParticipationService } from '../participation.service';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  styleUrls: ['./participation.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
  ]
})
export class ParticipationComponent implements OnInit {

  addForm = {} as FormGroup;
  participation = {} as Participation;
  participations = [] as Participation[];
  displayedColumns = [] as string[];
  loading = true;
  error: any;

  constructor(private formBuilder: FormBuilder,
              private participationService: ParticipationService) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      firstName: [this.participation.firstName, Validators.required],
      lastName: [this.participation.lastName, Validators.required],
      number: [this.participation.number, Validators.required],
      start: [this.participation.start, Validators.required],
      end: [this.participation.end]
    });
    this.displayedColumns = this.participationService.getFields();
    // this.displayedColumns.push("actions");
    this.participationService.onChange(({ data, loading }) => {
      console.debug(`on change (loading: ${loading})`);
      this.participations = data.participations;
      this.loading = loading;
    })
  }

  onAddParticipation(): void {
    this.participationService.addParticipation({
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      number: this.number.value,
      start: this.start.value,
      end: this.end.value
    });
    this.addForm.reset();
  }

  onRemoveParticipation(row: Participation): void {
    if (row._id)
      this.participationService.removeParticipation(row._id);
  }

  onRowClicked(row: Participation): void {
    console.debug(`remove participation with id ${row._id}`);
    if (row._id)
      this.participationService.removeParticipation(row._id);
  }

  get firstName() { return this.addForm.controls['firstName']; }
  get lastName() { return this.addForm.controls['lastName']; }
  get number() { return this.addForm.controls['number']; }
  get start() { return this.addForm.controls['start']; }
  get end() { return this.addForm.controls['end']; }

}
