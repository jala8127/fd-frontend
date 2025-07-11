import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kyc',
  imports: [CommonModule,FormsModule],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.css'
})
export class KycComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  isSubmitted = false;
  status: string | null = null;
  reason: string | null = null;

 kycData = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  currentAddress: '',
  permanentAddress: '',
  aadhaarNumber: '',
  panNumber: '',
  aadhaarDoc: null as File | null,
};

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input?.files?.length) {
    this.kycData.aadhaarDoc = input.files[0];
  }
}

submitKyc() {
  const formData = new FormData();

  for (const key of Object.keys(this.kycData) as (keyof typeof this.kycData)[]) {
    const value = this.kycData[key];
    if (value !== null && value !== undefined) {
      formData.append(
        key,
        value instanceof File ? value : value.toString()
      );
    }
  }

  // Now send formDataia HTTP POST...
}}