import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private router: Router, private http: HttpClient,private toastr: ToastrService) {}

  name: string = '';
  email: string = '';
  phone: string = '';
  dob: string = '';
  mpin: string = '';
  confirmMpin: string = '';
  otp: string = '';
  generatedOtp: string = '';

  showPassword = false;

  otpSent: boolean = false;
  otpVerified: boolean = false;
  userDetailsFilled: boolean = false;
  mpinSet: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  sendOtp() {
    if (!this.email) {
      this.toastr.warning('Enter an Email');
    }

    this.http.post('http://localhost:8080/api/auth/send-otp', null, {
      params: { email: this.email },
      responseType: 'text'
    }).subscribe({
      next: (otp) => {
        this.generatedOtp = otp;
        this.otpSent = true;
       this.toastr.success('OTP Sent successfully!');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to send OTP!');
      }
    });
  }

  verifyOtp() {
    if (this.otp === this.generatedOtp) {
    this.toastr.success('OTP Verified!');
      this.otpVerified = true;
    } else {
      this.toastr.error('Invalid OTP');
    }
  }

  proceedUserDetails() {
    if (!this.name || !this.phone || !this.dob) {
     this.toastr.warning('Please enter all required fields');
    }
    this.userDetailsFilled = true;
  }

  isValidMpin(): boolean {
    if (!/^\d{6}$/.test(this.mpin)) {
      this.toastr.warning('MPIN must be exactly 6 digits');
      return false;
    }

    const digitCount: { [key: string]: number } = {};
    for (let digit of this.mpin) {
      digitCount[digit] = (digitCount[digit] || 0) + 1;
      if (digitCount[digit] > 3) {
        this.toastr.warning('No digit can be repeated more than 3 times');
        return false;
      }
    }

    if (this.mpin !== this.confirmMpin) {
      this.toastr.warning('MPINs do not match');
      return false;
    }

    return true;
  }

  setMpin() {
    if (!this.isValidMpin()) return;

    this.toastr.success('MPIN set successfully!');
    this.mpinSet = true;
  }

  submitAccount() {
    const payload = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      dob: this.dob,
      mpin: this.mpin
      
    };

     this.http.post('http://localhost:8080/api/auth/register', payload, {
    responseType: 'text'  
  }).subscribe({
    next: (responseText) => {
      this.toastr.success(responseText);
      this.router.navigate(['login']);
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Error creating account. Please try again.');
    }
  });
  }
}