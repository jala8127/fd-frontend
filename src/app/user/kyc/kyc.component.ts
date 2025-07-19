import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-kyc',
  standalone: true,
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class KycComponent implements OnInit {
  kycData: any = {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    currentAddress: '',
    permanentAddress: '',
    aadhaarNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };

  selectedFile: File | null = null;
  userId: number = 0;
  isSubmitted = false;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | '' = '';
  reason: string = '';
  maxValidDob: string = '';
  sameAsCurrent = false; // Property for the new checkbox

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.userId = user.userId;
      this.kycData.fullName = user.name || '';
      this.kycData.email = user.email || '';
      this.kycData.phone = user.phone || '';
      this.kycData.dob = user.dob || '';
    }

    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    this.maxValidDob = today.toISOString().split('T')[0];

    // Re-enabled to fetch user's KYC status on load
    this.checkKycStatus();
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files?.[0] || null;
  }

  /* Handles the "Same as Current Address" checkbox logic.*/
  onSameAsCurrentChange(): void {
    if (this.sameAsCurrent) {
      this.kycData.permanentAddress = this.kycData.currentAddress;
    } else {
      this.kycData.permanentAddress = ''; // Clear the address when unchecked
    }
  }

  submitKyc() {
    if (!this.kycData.user) {
        this.kycData.user = { userId: this.userId };
    }

    const formData = new FormData();

    formData.append('kycData', new Blob([JSON.stringify(this.kycData)], {
      type: 'application/json'
    }));

    if (this.selectedFile) {
      formData.append('kycDocument', this.selectedFile, this.selectedFile.name);
    } else {
        this.toastr.error('Aadhaar document is required.', 'Validation Failed');
        return;
    }

    this.http.post('http://localhost:8080/api/kyc/submit', formData).subscribe({
      next: () => {
        this.toastr.success('KYC submitted successfully!', 'Success');
        this.isSubmitted = true;
        this.status = 'PENDING';
      },
      error: (err) => {
        console.error('KYC submission failed:', err);
        const errorMessage = err.error?.message || 'Something went wrong while submitting KYC';
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  checkKycStatus() {
    this.http.get<any[]>('http://localhost:8080/api/kyc/all').subscribe(data => {
      const userKyc = data.find(k => k.user?.userId === this.userId);
      if (userKyc) {
        this.isSubmitted = true;
        this.status = userKyc.status;
        const rawReason = userKyc.rejectionReason;
        try {
          const parsed = typeof rawReason === 'string' ? JSON.parse(rawReason) : rawReason;
          this.reason = parsed?.reason || parsed?.message || rawReason;
        } catch {
          this.reason = rawReason;
        }
      }
    });
  }

  reApply() {
    this.isSubmitted = false;
    this.status = '';
    this.reason = '';
    this.selectedFile = null;
    this.kycData = {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      currentAddress: '',
      permanentAddress: '',
      aadhaarNumber: '',
      panNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    };
    // Re-populate user data after clearing
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.kycData.fullName = user.name || '';
      this.kycData.email = user.email || '';
      this.kycData.phone = user.phone || '';
      this.kycData.dob = user.dob || '';
    }
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
  }
}
