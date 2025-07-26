import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  loginUser(email: string, mpin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, mpin });
  }

  loginEmployee(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees/login`, { email, password });
  }

  getUserEmail(): string {
    return localStorage.getItem('email') || '';
  }

  checkEmailExists(email: string): Observable<{exists: boolean}> {
    return this.http.get<{exists: boolean}>(`${this.baseUrl}/check-email/${email}`);
  }

   logout(): void {
    const wasLoggedIn = this.isLoggedIn();

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
    localStorage.removeItem('email');
    
    if (wasLoggedIn) {
     this.toastr.success('You have been logged out.');
      window.location.href = '/login';
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}