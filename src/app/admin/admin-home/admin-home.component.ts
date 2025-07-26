import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { EmployeeService } from '../../service/employee.service'; 
import { ToastrService } from 'ngx-toastr'; 
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../service/auth.service'; 

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  totalDeposits = 0;
  monthlyPayouts = 0;
  monthlyReceived = 0;
  recentTransactions: any[] = [];
  refreshSubscription!: Subscription;

  showAddCustomerModal = false;
  showKycModal = false;
  showRaiseTicketModal = false;
  showManualDepositModal = false;
  showPaymentConfirmationModal = false;

  selectedDocument: File | null = null;
  depositValidationError: string | null = null;
  allSchemes: any[] = [];
  selectedSchemeForDeposit: any = null;
  investmentAmount: number = 0;
  
  isProcessing = false;
  showLoader = false;
  paymentResult: 'SUCCESS' | null = null;
  depositPayload: any = null;
  
  
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Payouts', backgroundColor: '#e55bff' },
      { data: [], label: 'Payments', backgroundColor: '#a205ea' }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#444'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#555' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#555' }
      }
    }
  };

  constructor(
  private employeeService: EmployeeService, 
  private toastr: ToastrService,
  private http: HttpClient, 
  private authService: AuthService
) {}


ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchRecentTransactions();
    this.loadAllSchemes(); 
    this.fetchChartData(); 
    this.refreshSubscription = interval(60000).subscribe(() => {
        this.fetchDashboardData();
        this.fetchChartData(); 
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  fetchChartData(): void {
    this.employeeService.getMonthlyChartData().subscribe({
      next: (data) => {
        const labels = data.map(d => d.month);
        const paymentsData = data.map(d => d.totalPayments);
        const payoutsData = data.map(d => d.totalPayouts);

        this.barChartData = {
          labels: labels,
          datasets: [
            { data: payoutsData, label: 'Payouts', backgroundColor: '#e55bff' },
            { data: paymentsData, label: 'Payments', backgroundColor: '#a205ea' }
          ]
        };
      },
      error: (err) => {
        this.toastr.error('Could not load chart data.');
        console.error(err);
      }
    });
  }

  toggleModal(modal: 'addCustomer' | 'manualDeposit' | 'kyc'| 'raiseTicket', show: boolean): void {
    this.showAddCustomerModal = modal === 'addCustomer' && show;
    this.showKycModal = modal === 'kyc' && show;
    this.showManualDepositModal = modal === 'manualDeposit' && show;
    this.showRaiseTicketModal = modal === 'raiseTicket' && show; 

    if (modal === 'manualDeposit' && show) {
        this.depositValidationError = null; 
        this.selectedSchemeForDeposit = null;
        this.investmentAmount = 0;
    }
  }

  fetchDashboardData(): void {
    this.employeeService.getTotalDeposits().subscribe({
      next: res => this.totalDeposits = res.total,
      error: err => console.error('Failed to load total deposits', err)
    });

    this.employeeService.getMonthlyPayouts().subscribe({
      next: res => this.monthlyPayouts = res.total,
      error: err => console.error('Failed to load monthly payouts', err)
    });

    this.employeeService.getMonthlyReceived().subscribe({
      next: res => this.monthlyReceived = res.total,
      error: err => console.error('Failed to load monthly received', err)
    });
  }

  fetchRecentTransactions(): void {
    this.employeeService.getRecentTransactions().subscribe({
      next: data => this.recentTransactions = data.slice(0, 5),
      error: err => console.error('Failed to load recent transactions', err)
    });
  }

  loadAllSchemes(): void {
    this.http.get<any[]>("http://localhost:8080/api/schemes/all").subscribe({
      next: (data) => this.allSchemes = data,
      error: (err) => this.toastr.error("Could not load investment schemes.")
    });
  }

  addCustomer(form: NgForm): void {
    form.control.markAllAsTouched();

    let isAgeValid = true;
    let isMpinValid = true;

    if (form.value.dob) {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      if (new Date(form.value.dob) > eighteenYearsAgo) {
        form.controls['dob'].setErrors({'invalidAge': true});
        isAgeValid = false;
      }
    }

    const mpinControl = form.controls['mpin'];
    if (mpinControl && mpinControl.valid && mpinControl.value) {
        const consecutiveRegex = /(\d)\1{3,}/;
        if (consecutiveRegex.test(mpinControl.value)) {
            mpinControl.setErrors({'consecutive': true});
            isMpinValid = false;
        }
    }

    if (form.invalid || !isAgeValid || !isMpinValid) {
      this.toastr.error('Please correct the errors before submitting.');
      return;
    }

this.employeeService.addCustomer(form.value).subscribe({
      next: () => {
        this.toastr.success('Customer added successfully!');
        form.resetForm();
        this.toggleModal('addCustomer', false);
      },
      error: (err) => {

        if (err.status === 409) { 
          const errorMessage = err.error?.message || 'A customer with these details already exists.';
          
          this.toastr.error(errorMessage);

          if (errorMessage.toLowerCase().includes('email')) {
            form.controls['email'].setErrors({'exists': true});
          }
          if (errorMessage.toLowerCase().includes('phone')) {
            form.controls['phone'].setErrors({'exists': true});
          }
        } else {
          this.toastr.error('An unexpected error occurred. Please try again.');
        }
      }
    });
  }

   validateCustomerExists(email: string): void {
    if (!email || email.trim() === '') {
      this.depositValidationError = null;
      return;
    }
    this.authService.checkEmailExists(email).subscribe({
      next: (response) => {
        if (!response.exists) {
          this.depositValidationError = 'No user found with this email. Please add the customer first.';
        } else {
          this.depositValidationError = null; 
        } 
      },
      error: () => {
        this.depositValidationError = 'Could not validate email at this time.';
      }
    });
  }

  onSchemeChange(scheme: any): void {
    this.selectedSchemeForDeposit = scheme;
    if (this.selectedSchemeForDeposit) {
      this.investmentAmount = this.selectedSchemeForDeposit.minAmount;
    }
  }


  isInvestmentValid(): boolean {
    if (!this.selectedSchemeForDeposit) return false;
    return this.investmentAmount >= this.selectedSchemeForDeposit.minAmount;
  }

  calculateMaturityAmount(scheme: any): number {
    if (!scheme || !this.investmentAmount) return 0;
    const principal = this.investmentAmount;
    const annualRate = scheme.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const tenureMonths = scheme.tenureMonths;
    const amount = principal * Math.pow(1 + monthlyRate, tenureMonths);
    return Math.round(amount);
  }

  handleCreateDeposit(form: NgForm): void {
    if (!this.selectedSchemeForDeposit) {
      this.toastr.error("Please select a scheme before proceeding.");
      return;
    }

    if (form.invalid || this.depositValidationError) {
      this.toastr.error("Please correct the errors before proceeding.");
      return;
    }

    this.depositPayload = {
      userEmail: form.value.email,
      schemeId: this.selectedSchemeForDeposit.id,
      schemeName: this.selectedSchemeForDeposit.schemeName,
      status: 'SUCCESS',
      amount: this.investmentAmount,
      paymentMode: 'Cash', 
      receiverEmployeemailId: '' ,
      paymentDetails: ''
    };
    this.showManualDepositModal = false;
    this.showPaymentConfirmationModal = true;
  }

    isPaymentDetailValid(): boolean {
    const details = this.depositPayload.paymentDetails;
    if (!details) return false;

    switch (this.depositPayload.paymentMode) {
      case 'Cash':
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(details);
      case 'UPI':
        return /^[\w.-]+@[\w]+$/.test(details);
      case 'Card':
        return /^\d{16}$/.test(details.replace(/\s|-/g, ''));
      default:
        return false;
    }
  }

  confirmAdminPayment(): void {
    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;

    setTimeout(() => {
      this.employeeService.makeManualDeposit(this.depositPayload).subscribe({
        next: () => {
          this.paymentResult = 'SUCCESS';
          this.playSound('success');
          this.fetchDashboardData(); 
          this.fetchRecentTransactions(); 
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'An unexpected error occurred.');
          this.playSound('fail');
          this.showLoader = false;
          this.isProcessing = false;
          this.showPaymentConfirmationModal = false; 
        },
        complete: () => {
          this.showLoader = false;
          this.isProcessing = false;
        }
      });
    }, 1500); 
  }

  closeAllModals(): void {
    this.showManualDepositModal = false;
    this.showPaymentConfirmationModal = false;
    this.paymentResult = null;
    this.depositPayload = null;
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
   raiseTicket(form: NgForm): void {
    if (form.invalid) {
      this.toastr.error('Please fill all required fields to raise a ticket.');
      return;
    }
    this.employeeService.raiseTicket(form.value).subscribe({
      next: () => {
        this.toastr.success('Support ticket raised successfully!');
        form.resetForm();
        this.toggleModal('raiseTicket', false); 
      },
      error: (err: HttpErrorResponse) => this.toastr.error(err.error?.message || 'Failed to raise ticket.')
    });
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedDocument = input.files[0];
    }
  }

  verifyKYC(form: NgForm): void {
  if (form.invalid) {
    this.toastr.error('Please fill all the required fields.');
    return;
  }
  if (!this.selectedDocument) {
    this.toastr.error('Please upload the required document.');
    return;
  }

  const formValue = form.value;
  const kycPayload = {

    email: formValue.customerIdKyc, 
    fullName: formValue.name,
    phone: formValue.phone,
    dob: formValue.dob,
    currentAddress: formValue.currentAddress,
    permanentAddress: formValue.permanentAddress,
    aadhaarNumber: formValue.aadhaarNumber,
    panNumber: formValue.panNumber,
    bankName: formValue.bankName,
    accountNumber: formValue.accountNumber,
    ifscCode: formValue.ifscCode
  };

  const formData = new FormData();
  
  formData.append('kycData', new Blob([JSON.stringify(kycPayload)], { 
    type: 'application/json' 
  }));
  
  formData.append('kycDocument', this.selectedDocument, this.selectedDocument.name);
  this.http.post('http://localhost:8080/api/kyc/admin-submit', formData).subscribe({
    next: () => {
      this.toastr.success('Manual KYC submitted for verification!');
      form.resetForm();
      this.selectedDocument = null;
      this.toggleModal('kyc', false);
    },
    error: (err) => {
      this.toastr.error(err.error?.message || 'Failed to submit KYC.');
      console.error('Manual KYC submission failed:', err);
    }
  });
 }
}