import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css']
})
export class AdminPaymentsComponent implements OnInit {
  selectedTab: 'payments' | 'payouts' = 'payments';
  searchText: string = '';

  payments = [
    { userEmail: 'user1@example.com', amount: 50000, date: new Date(), mode: 'UPI' },
    { userEmail: 'user2@example.com', amount: 75000, date: new Date(), mode: 'Net Banking' }
  ];

  payouts = [
    { userEmail: 'user3@example.com', reason: 'Interest - Monthly', amount: 2000, dueDate: new Date(), status: 'Pending' },
    { userEmail: 'user4@example.com', reason: 'Premature Closure', amount: 25000, dueDate: new Date(), status: 'Pending' }
  ];

  ngOnInit(): void {}

  filteredPayments() {
    return this.payments.filter(p => p.userEmail.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  filteredPayouts() {
    return this.payouts.filter(p => p.userEmail.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  processPayout(payout: any) {
    payout.status = 'Paid';
    alert(`Payout of ₹${payout.amount} marked as paid for ${payout.userEmail}`);
  }
}