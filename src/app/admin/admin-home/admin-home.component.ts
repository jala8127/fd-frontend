import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
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

  barChartType: ChartType = 'bar';
  barChartLabels: string[] = ['MARCH', 'APRIL', 'MAY','JUN','JULY'];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.barChartLabels,
    datasets: [
      { data: [90000, 160000, 120000, 200000, 210000], label: 'Payouts by Bank', backgroundColor: '#e55bff' },
      { data: [140000, 220000, 180000, 250000, 300000], label: 'Customer payments', backgroundColor: '#a205ea' }
    ]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
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
    if (form.valid) {
      this.employeeService.addCustomer(form.value).subscribe(() => {
        this.toastr.success('Customer added successfully!');
        form.resetForm();
        this.toggleModal('addCustomer', false);
      });
    }
  }

  makeManualDeposit(form: NgForm): void {
    if (form.valid) {
      this.employeeService.makeManualDeposit(form.value).subscribe(() => {
        this.toastr.success('Deposit made successfully!');
        form.resetForm();
        this.fetchDashboardData();
        this.toggleModal('manualDeposit', false);
      });
    }
  }

  closeDeposit(form: NgForm): void {
    if (form.valid) {
      this.employeeService.closeDeposit(form.value).subscribe(() => {
        this.toastr.success('Deposit closed successfully!');
        form.resetForm();
        this.fetchDashboardData();
        this.toggleModal('closeDeposit', false);
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
    if (form.valid && this.selectedDocument) {
      const kycData = form.value;
      const formData = new FormData();
      formData.append('customerId', kycData.customerIdKyc);
      formData.append('document', this.selectedDocument);

      this.employeeService.verifyKyc(formData).subscribe(() => {
        this.toastr.success('KYC verified successfully!');
        form.resetForm();
        this.selectedDocument = null;
        this.toggleModal('kyc', false);
      });
    }
  }
}
