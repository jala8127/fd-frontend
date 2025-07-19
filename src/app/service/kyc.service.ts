import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private apiUrl = 'http://localhost:8080/api/kyc';

  constructor(private http: HttpClient) {}

  submitKyc(data: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/submit`, data);
}

  getKycStatus(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${email}`);
  }

  getPendingKycs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`);
  }

  verifyKyc(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/verify/${id}`, data);
  }
}