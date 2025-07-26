import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id: number;
  customerEmail: string;
  subject: string;
  description: string;
  priority: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  createdAt: string;
}

export interface NewTicketPayload {
  customerEmail: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/support';

  constructor(private http: HttpClient) {}

  getOpenTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/open`);
  }

  addTicket(newTicket: NewTicketPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, newTicket);
  }

  resolveTicket(ticketId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${ticketId}/resolve`, {});
  }
}