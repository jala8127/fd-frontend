import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
})
export class AdminHomeComponent {
  totalDeposits = 0;
  todaysPayouts = 0;
  todaysReceived = 0;

  showAddCustomerModal = false;
  showManualDepositModal = false;
  showKycModal = false;

  selectedDocument: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  toggleModal(modal: 'addCustomer' | 'manualDeposit' | 'kyc', show: boolean): void {
    this.showAddCustomerModal = modal === 'addCustomer' && show;
    this.showManualDepositModal = modal === 'manualDeposit' && show;
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