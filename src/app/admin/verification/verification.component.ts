import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

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

  // Inject ToastrService
  constructor(private http: HttpClient, private toastr: ToastrService) {}

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

    // Validation for empty rejection reason
    if (this.action === 'REJECTED' && (!this.rejectionReason || this.rejectionReason.trim() === '')) {
      this.toastr.error('Rejection reason cannot be empty.', 'Validation Error');
      return;
    }

    const kycId = this.selectedKyc.id;
    const url =
      this.action === 'APPROVED'
        ? `http://localhost:8080/api/kyc/${kycId}/approve`
        : `http://localhost:8080/api/kyc/${kycId}/reject`;

    // The backend expects the reason wrapped in a JSON object
    const body = this.action === 'REJECTED' ? { reason: this.rejectionReason } : {};

    this.http.put(url, body, { responseType: 'text' }).subscribe({
      next: () => {
        // --- THIS IS THE FIX ---
        const completedAction = this.action; // 1. Store the action before clearing it.
        
        this.toastr.success(`KYC ${completedAction?.toLowerCase()} successfully.`);
        
        // 2. Clear the state
        this.pendingKycs = this.pendingKycs.filter(k => k.id !== kycId);
        this.closeView();
      },
      error: () => this.toastr.error('Failed to update KYC status', 'Error')
    });
  }

  closeView(): void {
    this.selectedKyc = null;
    this.action = null;
    this.rejectionReason = '';
  }

  get formattedRejectionReason(): string {
    if (!this.selectedKyc || !this.selectedKyc.rejectionReason) {
      return '';
    }

    try {
      const parsed = JSON.parse(this.selectedKyc.rejectionReason);
      return parsed.reason || this.selectedKyc.rejectionReason;
    } catch (e) {
      return this.selectedKyc.rejectionReason;
    }
  }
}
