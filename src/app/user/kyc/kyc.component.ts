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
  imports: [CommonModule, FormsModule,RouterModule]
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
    panNumber: ''
  };

  selectedFile: File | null = null;
  userId: number = 0;
  isSubmitted = false;
  status: string = '';
  reason: string = '';

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
    }
    this.checkKycStatus();
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  isValidAadhaar(aadhaar: string): boolean {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
  }

  isValidPan(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan.toUpperCase());
  }

  submitKyc() {
    const aadhaar = this.kycData.aadhaarNumber;
    const pan = this.kycData.panNumber.toUpperCase();

    if (!this.isValidAadhaar(aadhaar)) {
      this.toastr.error('Aadhaar must be exactly 12 digits', 'Validation Failed');
      return;
    }

    if (!this.isValidPan(pan)) {
      this.toastr.error('PAN format must be like ABCDE1234F', 'Validation Failed');
      return;
    }

    const formData = new FormData();

    formData.append('userId', this.userId.toString());
    formData.append('fullName', this.kycData.fullName);
    formData.append('email', this.kycData.email);
    formData.append('phone', this.kycData.phone);
    formData.append('dob', this.kycData.dob);
    formData.append('currentAddress', this.kycData.currentAddress);
    formData.append('permanentAddress', this.kycData.permanentAddress);
    formData.append('panNumber', pan);
    formData.append('aadhaarNumber', aadhaar);

    if (this.selectedFile) {
      formData.append('aadhaarDocument', this.selectedFile);
    }

    this.http.post<{ message: string }>(
      'http://localhost:8080/api/kyc/submit',
      formData
    ).subscribe({
      next: (res) => {
        this.toastr.success('KYC submitted successfully!', 'Success');
        this.isSubmitted = true;
        this.status = 'PENDING';
      },
      error: (err) => {
        console.error('KYC submission failed:', err);
        this.toastr.error('Something went wrong while submitting KYC', 'Error');
      }
    });
  }

  checkKycStatus() {
    this.http.get<any[]>('http://localhost:8080/api/kyc/all').subscribe(data => {
      const userKyc = data.find(k => k.user?.userId === this.userId);
      if (userKyc) {
        this.isSubmitted = true;
        this.status = userKyc.status;
        this.reason = userKyc.rejectionReason || '';
      }
    });
  }

  reApply() {
    this.isSubmitted = false;
    this.status = '';
    this.reason = '';
    this.kycData = {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      currentAddress: '',
      permanentAddress: '',
      aadhaarNumber: '',
      panNumber: ''
    };
    this.selectedFile = null;
  }

  goToSchemes() {
    this.router.navigate(['/user/schemes']);
  }
}