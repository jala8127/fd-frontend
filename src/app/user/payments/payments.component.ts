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
  paymentDetails: string = '';
  paymentDetailsTouched: boolean = false;

  selectedPayment: any = null;

  isProcessing = false;
  showLoader = false;
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
      history.replaceState({}, '');
    }
  }

  fetchPaymentHistory() {
    this.http.get<any[]>(`http://localhost:8080/api/payments/user/${this.userEmail}`)
      .subscribe({
        next: (data) => {
          this.payments = data.sort((a, b) =>
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );
          console.log("Fetched Payments:", this.payments);
        },
        error: (err) => {
          console.error("Failed to fetch payments", err);
          this.toastr.error("Failed to load payment history.");
        }
      });
  }

  openPaymentModal(payment: any) {
    this.selectedPayment = payment;
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
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
    return /^\d{16}$/.test(this.paymentDetails.replace(/-/g, ''));
  }

  isPaymentValid(): boolean {
    return this.paymentMode === 'UPI'
      ? this.isUPIValid()
      : this.paymentMode === 'CARD'
      ? this.isCardValid()
      : false;
  }

  confirmPayment() {
    this.paymentDetailsTouched = true;

    if (!this.paymentDetails || !this.paymentMode || !this.isPaymentValid()) {
      this.toastr.warning('Please correct the payment details.');
      return;
    }

    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;

    setTimeout(() => {
      const isSuccess = Math.random() < 0.7;
      const status = isSuccess ? 'SUCCESS' : 'FAILED';

      const body = {
        email: this.userEmail,
        schemeId: this.scheme.id,
        schemeName: this.scheme.schemeName,
        amount: this.investmentAmount,
        paymentMode: this.paymentMode,
        status: status,
        paymentDetails: this.paymentDetails
      };

      this.http.post('http://localhost:8080/api/payments/create', body).subscribe({
        next: () => {
          this.paymentResult = status;
          this.showLoader = false;
          this.playSound(status === 'SUCCESS' ? 'success' : 'fail');
        },
        error: () => {
          this.paymentResult = 'FAILED';
          this.showLoader = false;
          this.playSound('fail');
        },
        complete: () => {
          this.isProcessing = false;
          this.fetchPaymentHistory();
        }
      });
    }, 2500);
  }

  closeModal() {
    this.scheme = null;
    this.paymentResult = null;
    this.showLoader = false;
    this.paymentDetails = '';
    this.paymentMode = 'UPI';
    this.investmentAmount = 0;
    this.paymentDetailsTouched = false;
  }

  playSound(type: 'success' | 'fail') {
    const audio = new Audio();
    audio.src = type === 'success' ? 'assets/success.mp3' : 'assets/fail.mp3';
    audio.play()
      .then(() => console.log(`${type} sound played`))
      .catch(err => console.error("Sound play error", err));
  }
}