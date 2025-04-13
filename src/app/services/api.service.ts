// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL = 'http://localhost:8080/skilllease-api/api';

  constructor(private http: HttpClient) { }

  // GET request
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseURL}${endpoint}`);
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseURL}${endpoint}`, data);
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseURL}${endpoint}`, data);
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${endpoint}`);
  }
}