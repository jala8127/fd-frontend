import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Ticket, TicketService } from '../../service/ticket.service';

type ComponentTicket = Omit<Ticket, 'status'> & {
  status: 'OPEN' | 'CLOSED';
};

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  
  allTickets: ComponentTicket[] = [];
  selectedTicket: ComponentTicket | null = null;
  activeTab: 'OPEN' | 'CLOSED' = 'OPEN';
  searchText: string = '';

  constructor(
    private ticketService: TicketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllTickets(); 
  }

  loadAllTickets(): void { 
    this.ticketService.getAllTickets().subscribe({ 
      next: (tickets) => {
        this.allTickets = tickets.map(ticket => ({
          ...ticket,
          status: ticket.status === 'RESOLVED' ? 'CLOSED' : ticket.status
        })) as any as ComponentTicket[];
      },
      error: (err) => {
        this.toastr.error('Failed to load support tickets.');
        console.error(err);
      }
    });
  }

  filteredTickets(): ComponentTicket[] {
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

  getTicketCount(status: 'OPEN' | 'CLOSED'): number {
    return this.allTickets.filter(t => t.status === status).length;
  }

  viewTicket(ticket: ComponentTicket): void {
    this.selectedTicket = ticket;
  }

  closeModal(): void {
    this.selectedTicket = null;
  }

  resolveTicket(ticket: ComponentTicket): void {
    this.ticketService.resolveTicket(ticket.id).subscribe({
      next: () => {
        this.toastr.success(`Ticket #${ticket.id} has been marked as resolved.`);
        const foundTicket = this.allTickets.find(t => t.id === ticket.id);
        if (foundTicket) {
          foundTicket.status = 'CLOSED';
        }
        this.closeModal();
      },
      error: (err) => {
        this.toastr.error('Failed to resolve ticket.');
        console.error(err);
      }
    });
  }
}
