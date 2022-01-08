import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

interface Participant {
  name: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  participantGroup = {} as FormGroup;
  participant = {} as Participant;
  participants = [] as Participant[];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.participantGroup = this.fb.group({
      name: [this.participant.name, Validators.required]
    })
  }

  onAddParticipant(): void {
    console.log('add participant ' + this.name);
    this.participants.push({ name: this.name.value });
    this.participantGroup.reset();
  }

  onRemoveParticipant(index: number) {
    this.participants.splice(index, 1);
  }

  get name() { return this.participantGroup.controls['name']; }
}
