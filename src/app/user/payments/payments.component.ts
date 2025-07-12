import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {
  scheme: any;
  investmentAmount: number = 0;
  paymentMode: string = 'UPI';
  payments: any[] = [];
  isProcessing: boolean = false;

  constructor(private router: Router, private http: HttpClient) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as {
      scheme: any;
      investmentAmount: number;
    };

    if (state) {
      this.scheme = state.scheme;
      this.investmentAmount = state.investmentAmount;
    }
  }

  ngOnInit(): void {
    console.log("💡 PaymentsComponent Initialized");  
      this.loadPayments();
  }
  loadPayments(): void {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.http.get<any[]>(`http://localhost:8080/api/payments/user/${userEmail}`)
        .subscribe(data => {
          this.payments = data;
        });
    }
  }

confirmPayment(): void {
  console.log("🚀 confirmPayment called"); 

  const email = localStorage.getItem('email');
  if (!email || !this.scheme) {
    console.error(" Missing email or scheme");
    return;
  }

  this.isProcessing = true;

  const isSuccess = true;

  const payload = {
    email: email,
    schemeId: this.scheme.id,
    amount: this.investmentAmount,
    paymentMode: this.paymentMode,
    status: isSuccess ? 'SUCCESS' : 'FAILED'
  };

  console.log("🔁 Sending payment request with payload:", payload); 

  setTimeout(() => {
    this.http.post('http://localhost:8080/api/payments/create', payload).subscribe({
      next: () => {
        this.isProcessing = false;
        alert(isSuccess ? 'Payment successful! FD Created.' : 'Payment failed.');
        this.loadPayments?.();
        if (isSuccess) this.router.navigate(['/user/deposits']);
      },
      error: err => {
        this.isProcessing = false;
        alert('Payment error: ' + (err.error?.message || 'Server error.'));
      }
    });
  }, 1500);
}

  goToSchemes(): void {
    this.router.navigate(['/user/schemes']);
  }
}