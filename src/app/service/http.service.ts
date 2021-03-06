import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  public get<Type>(url: string) {
    return this.httpClient.get<Type>(url, {
      observe: 'body',
      responseType: 'json',
    });
  }

  public getSingle<Type>(url: string, id: string) {
    return this.httpClient.get<Type>(url + '/' + id, {
      observe: 'body',
      responseType: 'json',
    });
  }

  public post(url: string, body: any) {
    return this.httpClient.post(url, body, {
      observe: 'body',
      responseType: 'json',
    });
  }

  public put(url: string, data: any, id: string, body: any) {
    return this.httpClient.put(url + '/' + id, body, {
      observe: 'body',
      responseType: 'json',
    });
  }

  public delete(url: string, id: string) {
    return this.httpClient.delete(url + '/' + id, {
      observe: 'body',
      responseType: 'json',
    });
  }
}
