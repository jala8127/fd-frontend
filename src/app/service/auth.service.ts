import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // User Login via MPIN
  loginUser(email: string, mpin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, mpin });
  }

  // Employee Login via Password
  loginEmployee(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees/login`, { email, password });
  }
}