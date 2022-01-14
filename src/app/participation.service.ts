import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BSON } from 'realm-web';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { MONGODB_API } from './common/mongodb';

export interface Participation {
  _id: BSON.ObjectID;
  firstName: string;
  lastName: string;
  number: number;
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {
  
  constructor(private authService: AuthService,
              private http: HttpClient) { }

  getFieldLabels(): string[] {
    return [
      'firstName',
      'lastName',
      'number',
      'start',
      'end'
    ]
  }

  findParticipations(
      filter: string = '', sortOrder: string = 'asc',
      page: number = 0, pageSize: number = 10) {
        // return this.http.get(MONGODB_API, {
        //     params: new HttpParams()
        //         .set('filter', filter)
        //         .set('sortOrder', sortOrder)
        //         .set('pageNumber', page.toString())
        //         .set('pageSize', pageSize.toString())
        // }).pipe(
        //     map(res =>  res["payload"])
        // );
  }

  addParticipation(firstName: string) {
    
  }

  removeParticipation(index: number) {
    
  }
}
