import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  CompletedGameResult
} from '../results/completed-game-result.model';


export interface ApiTestResponse {
  message: string;
}


export interface ApiChild {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}


export interface ChildrenResponse {
  children: ApiChild[];
}


export interface CreateChildResponse {
  message: string;
  child: ApiChild;
}


export interface SaveResultResponse {
  message: string;
  result: unknown;
}


export interface StoredGameResult {
  id: number;

  child_id: number;
  child_name: string;

  level_id: number;
  level_name: string;
  difficulty: string;

  steps: number;
  mistakes: number;
  time_seconds: number;

  completed: boolean;

  created_at: string;
  updated_at: string;
}


export interface ResultsResponse {
  results: StoredGameResult[];
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


  getChildren():
    Observable<ChildrenResponse> {

    return this.http.get<ChildrenResponse>(
      `${this.apiUrl}/children`
    );

  }


  createChild(
    name: string
  ): Observable<CreateChildResponse> {

    return this.http.post<CreateChildResponse>(
      `${this.apiUrl}/children`,
      {
        name: name
      }
    );

  }


  saveResult(
    result: CompletedGameResult
  ): Observable<SaveResultResponse> {

    return this.http.post<SaveResultResponse>(
      `${this.apiUrl}/results`,
      result
    );

  }


  getResults():
    Observable<ResultsResponse> {

    return this.http.get<ResultsResponse>(
      `${this.apiUrl}/results`
    );

  }

}