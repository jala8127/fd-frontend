import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TicketService } from '../../service/ticket.service';
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

    this.ticketService.addTicket({
      email: userEmail,
      subject: this.ticketSubject,
      message: this.ticketMessage
    });

    this.toastr.success('Your support ticket has been submitted!');
    this.closeContactModal();
  }
}
