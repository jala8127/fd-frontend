import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  loginUser(email: string, mpin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, mpin });
  }

  loginEmployee(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees/login`, { email, password });
  }
  getUserEmail(): string {
    return localStorage.getItem('email') || '';
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-email/${email}`);
  }

}