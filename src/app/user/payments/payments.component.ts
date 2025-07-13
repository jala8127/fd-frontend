import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  payments: any[] = [];
  scheme: any = null;

  userEmail: string = '';
  investmentAmount: number = 0;
  paymentMode: string = 'UPI';

  isProcessing = false;
  showLoader = false; 
  showSuccessTick = false;

  paymentResult: 'SUCCESS' | 'FAILED' | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('email') || '';
    this.fetchPaymentHistory();
    const navState = history.state;
    if (navState.scheme && navState.investmentAmount) {
      this.openDepositModal(navState.scheme, navState.investmentAmount);
    }
  }

  fetchPaymentHistory() {
    this.http.get<any[]>(`http://localhost:8080/api/payments/user/${this.userEmail}`)
      .subscribe({
        next: (data) => this.payments = data,
      });
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
  }

  openDepositModal(scheme: any, amount: number) {
    this.scheme = scheme;
    this.investmentAmount = amount;
  }

  confirmPayment() {
    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;

    setTimeout(() => {
      const isSuccess = Math.random() < 0.7;
      const status = isSuccess ? 'SUCCESS' : 'FAILED';

      const body = {
        email: this.userEmail,
        schemeId: this.scheme.id,
        amount: this.investmentAmount,
        paymentMode: this.paymentMode,
        status: status
      };

      this.http.post('http://localhost:8080/api/payments/create', body).subscribe({
        next: () => {
          this.paymentResult = status;
          this.showLoader = false;
          this.playSound(status === 'SUCCESS' ? 'success' : 'fail');
          this.fetchPaymentHistory();
        },
        error: () => {
          this.paymentResult = 'FAILED';
          this.showLoader = false;
          this.playSound('fail');
        },
        complete: () => this.isProcessing = false
      });
    }, 2500);
  }

  closeModal() {
    this.scheme = null;
    this.paymentResult = null;
    this.showLoader = false;
  }

  playSound(type: 'success' | 'fail') {
    const audio = new Audio();
    audio.src = `assets/success.mp3`;
    audio.load();
    audio.play().catch(err => console.error("Sound play error", err));
  }
}