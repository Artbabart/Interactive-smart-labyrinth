import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface ApiTestResponse {
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly apiUrl =
    'http://127.0.0.1:8000/api';


  constructor(
    private http: HttpClient
  ) {}


  testConnection():
    Observable<ApiTestResponse> {

    return this.http.get<ApiTestResponse>(
      `${this.apiUrl}/test`
    );

  }

}