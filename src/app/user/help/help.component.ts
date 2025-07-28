import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TicketService, NewTicketPayload, Ticket } from '../../service/ticket.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  ticketSubject = '';
  ticketMessage = '';
  userTickets: Ticket[] = [];

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserTickets();
  }

  loadUserTickets(): void {
    const userEmail = this.authService.getUserEmail();
    if (!userEmail) {
      this.toastr.error('Could not identify user. Please log in again.');
      return;
    }

    this.ticketService.getTicketsByEmail(userEmail).subscribe({
      next: (tickets: Ticket[]) => { 
        this.userTickets = tickets;
      },
      error: (err: any) => { 
        console.error('Failed to fetch tickets', err);
        this.toastr.error('Could not load your support tickets.');
      }
    });
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketMessage.trim()) {
      this.toastr.error('Subject and message cannot be empty.');
      return;
    }

    const userEmail = this.authService.getUserEmail();
    if (!userEmail) {
      this.toastr.error('Could not identify user. Please log in again.');
      return;
    }

    const payload: NewTicketPayload = {
      customerEmail: userEmail,
      subject: this.ticketSubject,
      description: this.ticketMessage,
      priority: 'MEDIUM'
    };

    this.ticketService.addTicket(payload).subscribe({
      next: () => {
        this.toastr.success('Your support ticket has been submitted successfully!');
        this.ticketSubject = '';
        this.ticketMessage = '';
        this.loadUserTickets(); 
      },
      error: (err: any) => { 
        this.toastr.error('Failed to submit ticket. Please try again later.');
        console.error(err);
      }
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace('_', ' ').toLowerCase();
  }
}