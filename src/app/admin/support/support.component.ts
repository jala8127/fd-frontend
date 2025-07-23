import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit{
  
  allTickets: any[] = [];
  selectedTicket: any = null;
  activeTab: 'OPEN' | 'PENDING' | 'RESOLVED' = 'OPEN';
  searchText: string = '';

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.allTickets = [
      { id: 1024, email: 'harisri@gmail.com', subject: 'Problem with my deposit', date: new Date(), status: 'OPEN', message: 'I tried to create a new fixed deposit but the transaction failed. Can you please look into it?' },
      { id: 1023, email: 'gopika@gmail.com', subject: 'Question about interest rates', date: new Date(Date.now() - 86400000), status: 'PENDING', message: 'I saw the new interest rates for senior citizens. Do I qualify? My date of birth is 1960-05-15.' },
      { id: 1022, email: 'gaurav@gmail.com', subject: 'KYC Verification Status', date: new Date(Date.now() - 172800000), status: 'OPEN', message: 'Hi, I submitted my KYC documents two days ago and wanted to check on the status. Thank you.' },
      { id: 1021, email: 'abbynayashri@gmail.com', subject: 'Login Issue', date: new Date(Date.now() - 259200000), status: 'RESOLVED', message: 'I was unable to log in but the forgot password feature worked. You can close this ticket.' },
    ];
  }

  filteredTickets(): any[] {
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
      return 1; 
    }
    return this.allTickets.filter(t => t.status === status).length;
  }

  viewTicket(ticket: any): void {
    this.selectedTicket = ticket;
  }

  closeModal(): void {
    this.selectedTicket = null;
  }

  resolveTicket(ticket: any): void {
    ticket.status = 'RESOLVED';
    this.toastr.success(`Ticket #${ticket.id} has been marked as resolved.`);
    this.closeModal();
  }
}