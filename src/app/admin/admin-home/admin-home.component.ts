import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { EmployeeService } from '../../service/employee.service'; 
import { ToastrService } from 'ngx-toastr'; 

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

  showAddCustomerModal = false;
  showManualDepositModal = false;
  showCloseDepositModal = false;
  showKycModal = false;
  selectedDocument: File | null = null;
  recentTransactions: any[] = [];
  refreshSubscription!: Subscription;
  
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['MARCH', 'APRIL', 'MAY','JUN','JULY'],
    datasets: [
      { data: [90000, 160000, 120000, 200000, 210000], label: 'Payouts by Bank', backgroundColor: '#e55bff' },
      { data: [140000, 220000, 180000, 250000, 300000], label: 'Customer payments', backgroundColor: '#a205ea' }
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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchRecentTransactions();

    this.refreshSubscription = interval(30000).subscribe(() => {
      this.fetchDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleModal(modal: 'addCustomer' | 'manualDeposit' | 'kyc'| 'closeDeposit', show: boolean): void {
    this.showAddCustomerModal = modal === 'addCustomer' && show;
    this.showManualDepositModal = modal === 'manualDeposit' && show;
    this.showCloseDepositModal = modal === 'closeDeposit' && show;
    this.showKycModal = modal === 'kyc' && show;
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
      next: data => this.recentTransactions = data.slice(0, 4),
      error: err => console.error('Failed to load recent transactions', err)
    });
  }

  addCustomer(form: NgForm): void {
    // Mark all fields as touched to display validation errors when user tries to submit
    form.control.markAllAsTouched();

    // --- Custom Validation Logic ---
    let isAgeValid = true;
    let isMpinValid = true;

    // 1. Age Validation
    if (form.value.dob) {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      if (new Date(form.value.dob) > eighteenYearsAgo) {
        form.controls['dob'].setErrors({'invalidAge': true});
        isAgeValid = false;
      }
    }

    // 2. MPIN Consecutive Digits Validation
    const mpinControl = form.controls['mpin'];
    if (mpinControl && mpinControl.valid && mpinControl.value) {
        // This regex checks for any digit (\d) that is repeated 3 or more times after itself ({3,}), meaning 4+ times in a row.
        const consecutiveRegex = /(\d)\1{3,}/;
        if (consecutiveRegex.test(mpinControl.value)) {
            // Set a custom error on the mpin form control
            mpinControl.setErrors({'consecutive': true});
            isMpinValid = false;
        }
    }

    // --- Final Form Validity Check ---
    if (form.invalid || !isAgeValid || !isMpinValid) {
      this.toastr.error('Please correct the errors before submitting.');
      return;
    }

    // If form is fully valid, proceed to add customer
    // The form.value will now contain 'mpin' and not 'address'
    this.employeeService.addCustomer(form.value).subscribe({
      next: () => {
        this.toastr.success('Customer added successfully!');
        form.resetForm();
        this.toggleModal('addCustomer', false);
      },
      error: (err) => {
        // This block handles errors from the backend, including the check for existing email/phone
        if (err.status === 409) { // 409 Conflict
          const errorMessage = err.error?.message || 'A customer with these details already exists.';
          this.toastr.error(errorMessage);
          // Set inline errors on the specific fields based on backend response
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

  makeManualDeposit(form: NgForm): void {
    if (form.valid) {
      this.employeeService.makeManualDeposit(form.value).subscribe({
        next: () => {
          this.toastr.success('Deposit made successfully!');
          form.resetForm();
          this.fetchDashboardData();
          this.toggleModal('manualDeposit', false);
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to make deposit.')
      });
    }
  }

  closeDeposit(form: NgForm): void {
    if (form.valid) {
      this.employeeService.closeDeposit(form.value).subscribe({
        next: () => {
          this.toastr.success('Deposit closed successfully!');
          form.resetForm();
          this.fetchDashboardData();
          this.toggleModal('closeDeposit', false);
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to close deposit.')
      });
    }
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

    const kycData = form.value;
    const formData = new FormData();
    formData.append('customerId', kycData.customerIdKyc);
    formData.append('document', this.selectedDocument);

    this.employeeService.verifyKyc(formData).subscribe({
      next: () => {
        this.toastr.success('KYC verified successfully!');
        form.resetForm();
        this.selectedDocument = null;
        this.toggleModal('kyc', false);
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to verify KYC.')
    });
  }
}
