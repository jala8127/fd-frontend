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
  selectedPayout: any = null;

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
    return this.payments.filter(p =>
      p.userEmail.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  filteredPayouts() {
    return this.payouts.filter(p =>
      p.userEmail.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  viewPayout(payout: any) {
    console.log('Opening modal for:', payout);
    this.selectedPayout = payout;
  }

  closeModal() {
    this.selectedPayout = null;
  }
}