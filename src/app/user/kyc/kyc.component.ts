import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CustomerService, Customer } from '../../service/customer.service';

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
  userId: number | undefined = 0; 
  isSubmitted = false;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | '' = '';
  reason: string = '';
  maxValidDob: string = '';
  sameAsCurrent = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    this.maxValidDob = today.toISOString().split('T')[0];

    this.customerService.getLoggedInUserDetails().subscribe({
      next: (user: Customer) => {
        if (user) {
          this.userId = user.userId;
          this.kycData.fullName = user.name || '';
          this.kycData.email = user.email || '';
          this.kycData.phone = user.phone || '';
          this.kycData.dob = user.dob || '';
          
          this.checkKycStatus();
        } else {
          this.toastr.error("Could not retrieve user details for KYC.");
        }
      },
      error: (err) => {
        console.error("Failed to load user for KYC:", err);
        this.toastr.error("Session may have expired. Please log in again.");
        this.router.navigate(['/login']);
      }
    });
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files?.[0] || null;
  }

  onSameAsCurrentChange(): void {
    if (this.sameAsCurrent) {
      this.kycData.permanentAddress = this.kycData.currentAddress;
    } else {
      this.kycData.permanentAddress = '';
    }
  }

  submitKyc() {

    if (!this.userId) {
        this.toastr.error('User ID is missing. Cannot submit KYC.');
        return;
    }
    

    this.kycData.user = { userId: this.userId };

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

    if (!this.userId) return;

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

    this.ngOnInit();
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
  }
}
