import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Ticket, TicketService } from '../../service/ticket.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit, OnDestroy {
  
  allTickets: Ticket[] = [];
  private ticketSubscription!: Subscription;

  selectedTicket: Ticket | null = null;
  activeTab: 'OPEN' | 'PENDING' | 'RESOLVED' = 'OPEN';
  searchText: string = '';

  constructor(
    private ticketService: TicketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Subscribe to the ticket service to get live updates
    this.ticketSubscription = this.ticketService.getTickets().subscribe(tickets => {
      this.allTickets = tickets;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.ticketSubscription) {
      this.ticketSubscription.unsubscribe();
    }
  }

  filteredTickets(): Ticket[] {
    let tickets = this.allTickets.filter(t => t.status === this.activeTab);
    
    if (this.searchText) {
      const lowerSearch = this.searchText.toLowerCase();
      tickets = tickets.filter(t => 
        t.email.toLowerCase().includes(lowerSearch) || 
        t.subject.toLowerCase().includes(lowerSearch)
      );
    }
    
    return tickets;
  }

  getTicketCount(status: 'OPEN' | 'PENDING' | 'RESOLVED_TODAY'): number {
    if (status === 'RESOLVED_TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      return this.allTickets.filter(t => {
        const ticketDate = new Date(t.date);
        ticketDate.setHours(0, 0, 0, 0); // Set ticket date to start of its day
        return t.status === 'RESOLVED' && ticketDate.getTime() === today.getTime();
      }).length;
    }
    return this.allTickets.filter(t => t.status === status).length;
  }

  viewTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  closeModal(): void {
    this.selectedTicket = null;
  }

  resolveTicket(ticket: Ticket): void {
    // Call the service to resolve the ticket
    this.ticketService.resolveTicket(ticket.id);
    this.toastr.success(`Ticket #${ticket.id} has been marked as resolved.`);
    this.closeModal();
  }
}
