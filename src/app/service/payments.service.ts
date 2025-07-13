import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  getPendingPayments(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending/${email}`);
  }

  getPaymentHistory(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${email}`);
  }

  payForFD(fdId: number, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/pay`, { fdId, email });
  }
}