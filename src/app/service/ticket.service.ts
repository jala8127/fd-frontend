import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Ticket {
  id: number;
  email: string;
  subject: string;
  date: Date;
  status: 'OPEN' | 'PENDING' | 'RESOLVED';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private tickets$ = new BehaviorSubject<Ticket[]>([]);

  constructor() { }

  getTickets(): Observable<Ticket[]> {
    return this.tickets$.asObservable();
  }

  addTicket(newTicket: Omit<Ticket, 'id' | 'date' | 'status'> & { email: string }): void {
    const currentTickets = this.tickets$.getValue();
    const ticketToAdd: Ticket = {
      ...newTicket,
      id: Date.now(), 
      date: new Date(),
      status: 'OPEN'
    };
    this.tickets$.next([ticketToAdd, ...currentTickets]);
  }

  resolveTicket(ticketId: number): void {
    const currentTickets = this.tickets$.getValue();
    const updatedTickets = currentTickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, status: 'RESOLVED' as const };
      }
      return ticket;
    });
    this.tickets$.next(updatedTickets);
  }
}
