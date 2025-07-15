import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verification',
  standalone: true,
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css'],
  imports: [CommonModule, FormsModule]
})
export class VerificationComponent implements OnInit {
  selectedTab: 'pending' | 'completed' = 'pending';
  pendingKycs: any[] = [];
  completedKycs: any[] = [];
  selectedKyc: any = null;
  action: 'APPROVED' | 'REJECTED' | null = null;
  rejectionReason: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPendingKycs();
  }

  changeTab(tab: 'pending' | 'completed') {
  this.selectedTab = tab;
  this.selectedKyc = null;
  this.action = null;
  this.rejectionReason = '';

  if (tab === 'pending') {
    this.loadPendingKycs();
  } else if (tab === 'completed') {
    this.loadCompletedKycs();
  }
}

  loadPendingKycs(): void {
    this.http.get<any[]>('http://localhost:8080/api/kyc/pending')
      .subscribe(data => {
        this.pendingKycs = data;
      });
  }

  loadCompletedKycs(): void {
    this.http.get<any[]>('http://localhost:8080/api/kyc/completed')
      .subscribe(data => {
        this.completedKycs = data;
      });
  }

  viewKycDetails(kyc: any): void {
    this.selectedKyc = kyc;
    this.action = null;
    this.rejectionReason = '';
  }

  setAction(type: 'APPROVED' | 'REJECTED'): void {
    this.action = type;
  }

  verifyKyc(): void {
    if (!this.selectedKyc || !this.action) return;

    const kycId = this.selectedKyc.id;
    const url =
      this.action === 'APPROVED'
        ? `http://localhost:8080/api/kyc/${kycId}/approve`
        : `http://localhost:8080/api/kyc/${kycId}/reject`;

    const body = this.action === 'REJECTED' ? { reason: this.rejectionReason } : {};

    this.http.put(url, body, { responseType: 'text' }).subscribe({
      next: () => {
        this.pendingKycs = this.pendingKycs.filter(k => k.id !== kycId);
        this.selectedKyc = null;
        this.action = null;
        this.rejectionReason = '';
        alert(`KYC ${this.action} successfully.`);
      },
      error: () => alert('Failed to update KYC status')
    });
  }

  closeView(): void {
    this.selectedKyc = null;
    this.action = null;
    this.rejectionReason = '';
  }
}