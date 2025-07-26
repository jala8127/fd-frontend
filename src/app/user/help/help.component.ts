import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TicketService, NewTicketPayload } from '../../service/ticket.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css'
})
export class HelpComponent {
  showContactModal = false;
  ticketSubject = '';
  ticketMessage = '';
  ticketPriority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  openContactModal(): void {
    this.showContactModal = true;
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.ticketSubject = '';
    this.ticketMessage = '';
    this.ticketPriority = 'MEDIUM';
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
      priority: this.ticketPriority
    };

    this.ticketService.addTicket(payload).subscribe({
      next: () => {
        this.toastr.success('Your support ticket has been submitted successfully!');
        this.closeContactModal();
      },
      error: (err) => {
        this.toastr.error('Failed to submit ticket. Please try again later.');
        console.error(err);
      }
    });
  }
}
