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

  payments: any[] = [];
  payouts: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPayments();
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

  processPayout(payout: any) {
    payout.status = 'Paid';
    alert(`Payout of ₹${payout.amount} marked as paid for ${payout.userEmail}`);
  }
}