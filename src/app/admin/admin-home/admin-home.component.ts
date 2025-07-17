import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  totalDeposits = 0;
  todaysPayouts = 0;
  todaysReceived = 0;

  showAddCustomerModal = false;
  showManualDepositModal = false;
  showCloseDepositModal = false;
  showKycModal = false;

  selectedDocument: File | null = null;
  recentTransactions: any[] = [];

  refreshSubscription!: Subscription;

  // Chart.js Variables
  barChartType: ChartType = 'bar';
  barChartLabels: string[] = ['JAN', 'FEB', 'MARCH', 'APRIL', 'MAY'];
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchRecentTransactions();

    this.refreshSubscription = interval(10000).subscribe(() => {
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
    this.http.get<{ total: number }>('/api/admin/total-deposits')
      .subscribe(res => this.totalDeposits = res.total);

    this.http.get<{ total: number }>('/api/admin/todays-payouts')
      .subscribe(res => this.todaysPayouts = res.total);

    this.http.get<{ total: number }>('/api/admin/todays-received')
      .subscribe(res => this.todaysReceived = res.total);
  }

  fetchRecentTransactions(): void {
    this.http.get<any[]>('/api/admin/recent-transactions')
      .subscribe(data => {
        this.recentTransactions = data.slice(0, 5);
      });
  }

  addCustomer(form: NgForm): void {
    if (form.valid) {
      this.http.post('/api/admin/add-customer', form.value)
        .subscribe(() => {
          form.resetForm();
          this.toggleModal('addCustomer', false);
        });
    }
  }

  makeManualDeposit(form: NgForm): void {
    if (form.valid) {
      this.http.post('/api/admin/manual-deposit', form.value)
        .subscribe(() => {
          form.resetForm();
          this.fetchDashboardData();
          this.toggleModal('manualDeposit', false);
        });
    }
  }

  closeDeposit(form: NgForm): void {
    if (form.valid) {
      this.http.post('/api/admin/close-deposit', form.value)
        .subscribe(() => {
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

      this.http.post('/api/admin/verify-kyc', formData)
        .subscribe(() => {
          form.resetForm();
          this.selectedDocument = null;
          this.toggleModal('kyc', false);
        });
    }
  }
}