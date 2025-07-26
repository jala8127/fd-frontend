import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Ticket, TicketService } from '../../service/ticket.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  
  allTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  activeTab: 'OPEN' | 'PENDING' | 'RESOLVED' = 'OPEN';
  searchText: string = '';

  constructor(
    private ticketService: TicketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOpenTickets();
  }

  loadOpenTickets(): void {
    this.ticketService.getOpenTickets().subscribe({
      next: (tickets) => {
        this.allTickets = tickets;
      },
      error: (err) => {
        this.toastr.error('Failed to load support tickets.');
        console.error(err);
      }
    });
  }

  filteredTickets(): Ticket[] {
    let tickets = this.allTickets.filter(t => t.status === this.activeTab);
    
    if (this.searchText) {
      const lowerSearch = this.searchText.toLowerCase();
      tickets = tickets.filter(t => 
        t.customerEmail.toLowerCase().includes(lowerSearch) || 
        t.subject.toLowerCase().includes(lowerSearch)
      );
    }
    
    return tickets;
  }

  getTicketCount(status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'RESOLVED_TODAY'): number {
    if (status === 'RESOLVED_TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return this.allTickets.filter(t => {

        const ticketDate = new Date(t.createdAt);
        ticketDate.setHours(0, 0, 0, 0);
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
    this.ticketService.resolveTicket(ticket.id).subscribe({
      next: () => {
        this.toastr.success(`Ticket #${ticket.id} has been marked as resolved.`);
        this.loadOpenTickets(); 
        this.closeModal();
      },
      error: (err) => {
        this.toastr.error('Failed to resolve ticket.');
        console.error(err);
      }
    });
  }
}
