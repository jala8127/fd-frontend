import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private baseUrl = 'http://localhost:8080/api/otp';

  constructor(private http: HttpClient) {}

  sendOtp(email: string) {
    return this.http.post(this.baseUrl + '/send', null, {
      params: { email },
      responseType: 'text',
    });
  }
}