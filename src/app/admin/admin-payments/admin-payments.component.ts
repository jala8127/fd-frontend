import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css']
})
export class AdminPaymentsComponent implements OnInit {
  selectedTab: 'payments' | 'payouts' = 'payments';
  searchText: string = '';
  
  // Properties to hold the data for each modal
  selectedPayout: any = null;
  selectedPayment: any = null; // NEW: Property for the payment modal

  payments: any[] = [];
  payouts: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPayments();
    this.fetchPayouts();
  }

  fetchPayments() {
    this.http.get<any[]>('http://localhost:8080/api/payments/all').subscribe({
      next: (data) => {
        this.payments = data;
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
      }
    });
  }

  fetchPayouts() {
    this.http.get<any[]>('http://localhost:8080/api/payouts').subscribe({
      next: (data) => {
        this.payouts = data;
      },
      error: (err) => {
        console.error('Failed to load payouts:', err);
      }
    });
  }

  filteredPayments() {
    if (!this.searchText) {
      return this.payments;
    }
    return this.payments.filter(p =>
      p.userEmail && p.userEmail.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  filteredPayouts() {
    if (!this.searchText) {
      return this.payouts;
    }
    return this.payouts.filter(p =>
      p.userEmail && p.userEmail.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // This method opens the Payout modal
  viewPayout(payout: any) {
    this.selectedPayout = payout;
  }

  // NEW: This method opens the Payment modal
  viewPayment(payment: any) {
    this.selectedPayment = payment;
  }

  // UPDATED: This method now closes both modals
  closeModal() {
    this.selectedPayout = null;
    this.selectedPayment = null;
  }
}
