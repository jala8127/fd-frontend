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
  payouts: any[] = [];

  selectedPayment: any = null;
  selectedPayout: any = null;
  selectedTab: string = 'payments';

  scheme: any = null;
  userEmail: string = '';
  investmentAmount: number = 0;

  paymentMode: string = 'UPI';
  paymentDetails: string = '';
  paymentDetailsTouched: boolean = false;

  isProcessing = false;
  showLoader = false;
  paymentResult: 'SUCCESS' | 'FAILED' | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = sessionStorage.getItem('email') || '';
    this.fetchPaymentHistory();
    this.fetchPayoutHistory();

    const navState = history.state;
    if (navState.scheme && navState.investmentAmount) {
      this.openDepositModal(navState.scheme, navState.investmentAmount);
      history.replaceState({}, ''); 
    }
  }

  fetchPaymentHistory() {
    this.http.get<any[]>(`http://localhost:8080/api/payments/user/${this.userEmail}`).subscribe({
      next: (data) => {
        this.payments = data.sort((a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
      },
      error: (err) => {
        console.error("Failed to fetch payments", err);
        this.toastr.error("Failed to load payment history.");
      }
    });
  }

  fetchPayoutHistory() {
    this.http.get<any[]>(`http://localhost:8080/api/payouts/user/${this.userEmail}`).subscribe({
      next: (data) => {
        this.payouts = data.sort((a, b) =>
          new Date(b.payoutDate).getTime() - new Date(a.payoutDate).getTime()
        );
      },
      error: (err) => {
        console.error("Failed to fetch payouts", err);
        this.toastr.error("Failed to load payout history.");
      }
    });
  }

  openPaymentModal(payment: any) {
    this.selectedPayment = payment;
  }

  openPayoutModal(payout: any) {
    this.selectedPayout = payout;
  }

  closeModal() {
    this.selectedPayment = null;
    this.selectedPayout = null;
    this.scheme = null;
    this.paymentResult = null;
  }

  openDepositModal(scheme: any, amount: number) {
    this.scheme = scheme;
    this.investmentAmount = amount;
    this.paymentDetails = '';
    this.paymentMode = 'UPI';
    this.paymentResult = null;
    this.paymentDetailsTouched = false;
  }

  onPaymentDetailsChange() {
    this.paymentDetailsTouched = true;
  }

  onPaymentModeChange() {
    this.paymentDetails = '';
    this.paymentDetailsTouched = false;
  }

  isUPIValid(): boolean {
    return /^[\w.-]+@[\w]+$/.test(this.paymentDetails);
  }

  isCardValid(): boolean {
    return /^\d{16}$/.test(this.paymentDetails.replace(/\s|-/g, ''));
  }

  isPaymentValid(): boolean {
    if (!this.paymentDetails) return false;

    return this.paymentMode === 'UPI'
      ? this.isUPIValid()
      : this.paymentMode === 'CARD'
      ? this.isCardValid()
      : false;
  }

  confirmPayment() {
    this.paymentDetailsTouched = true;

    if (!this.isPaymentValid()) {
      this.toastr.warning('Please enter valid payment details.');
      return;
    }

    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;

    const body = {
      email: this.userEmail,
      schemeId: this.scheme.id,
      schemeName: this.scheme.schemeName,
      amount: this.investmentAmount,
      paymentMode: this.paymentMode,
      status: '', 
      paymentDetails: this.paymentDetails
    };

    setTimeout(() => {
      const isSuccess = Math.random() < 0.7;
      body.status = isSuccess ? 'SUCCESS' : 'FAILED';

      this.http.post('http://localhost:8080/api/payments/create', body).subscribe({
        next: () => {
          this.paymentResult = body.status as 'SUCCESS' | 'FAILED';
          this.playSound(this.paymentResult.toLowerCase() as 'success' | 'fail');
        },
        error: () => {
          this.paymentResult = 'FAILED';
          this.playSound('fail');
        },
        complete: () => {
          this.showLoader = false;
          this.isProcessing = false;
          this.fetchPaymentHistory();
        }
      });
    }, 2500);
  }

  playSound(type: 'success' | 'fail') {
    const audio = new Audio();
    audio.src = type === 'success'
      ? 'assets/success.mp3'
      : 'assets/fail.mp3';

    audio.play().catch(err => {
      console.warn(`Error playing sound: ${type}`, err);
    });
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
  }
}