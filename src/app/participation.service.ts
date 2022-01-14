import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { MongoClient } from 'mongodb';
import { BSON } from 'realm-web';
import { AuthService } from './auth.service';

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

  // findParticipations(): Observable<Participation[]> {
  //     return this.http.post(MONGODB_API + '/action/findOne',
  //       {
  //         'dataSource':'Cluster0',
  //         'database':'fclg-youth-lottery',
  //         'collection':'participations',
  //         'filter': { 'firstName': 'Marvin' }
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Access-Control-Request-Headers': '*',
  //           'Access-Control-Allow-Origin': 'https://data.mongodb-api.com',
  //           'api-key': MONGODB_API_KEY
  //         }
  //       }) as Observable<Participation[]>;
  // }

  addParticipation(firstName: string) {
    
  }

  removeParticipation(index: number) {
    
  }
}
