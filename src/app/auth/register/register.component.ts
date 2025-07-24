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
  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  name = '';
  email = '';
  phone = '';
  dob = '';
  mpin = '';
  confirmMpin = '';
  otp = '';
  generatedOtp = '';

  showPassword = false;

  otpSent = false;
  otpVerified = false;
  userDetailsFilled = false;
  mpinSet = false;
  isSendingOtp = false;

  nameError = '';
  phoneError = '';
  dobError = '';
  emailError = '';
  mpinError = '';
  confirmMpinError = '';

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = emailRegex.test(this.email) ? '' : 'Invalid email format';
  }

  onNameChange() {
    const nameRegex = /^[A-Za-z.\s]{3,50}$/;
    this.nameError = nameRegex.test(this.name) ? '' : 'Enter valid name';
  }

  onPhoneChange() {
    this.phoneError = /^\d{10}$/.test(this.phone) ? '' : 'Enter valid Phone';
  }

  onDobChange() {
    if (!this.dob) {
      this.dobError = 'Date of birth is required';
      return;
    }

    const birthDate = new Date(this.dob);
    if (isNaN(birthDate.getTime())) {
      this.dobError = 'Invalid date format';
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    this.dobError = age < 18 ? 'You must be at least 18 years old' : '';
  }

  sendOtp() {
    this.onEmailChange();

    if (this.emailError) return;

    this.isSendingOtp = true;

    this.http
      .post<{ otp: string, message: string }>('http://localhost:8080/api/auth/send-otp', null, {
        params: { email: this.email }
      })
      .subscribe({
        next: (response) => {
          this.generatedOtp = response.otp;
          this.otpSent = true;
          this.toastr.success('OTP Sent successfully!');
          this.isSendingOtp = false;
        },
        error: (err) => {
          this.isSendingOtp = false;
          if (err.status === 409) {
            this.emailError = 'Email already registered';
          } else {
            this.toastr.error('Failed to send OTP!');
          }
        }
      });
  }

  verifyOtp() {
    if (!this.otpSent) {
      this.toastr.error('OTP not sent yet!');
      return;
    }

    if (this.otp === this.generatedOtp) {
      this.toastr.success('OTP Verified!');
      this.otpVerified = true;
    } else {
      this.toastr.error('Invalid OTP');
    }
  }

  proceedUserDetails() {
    this.onNameChange();
    this.onPhoneChange();
    this.onDobChange();

    if (this.nameError || this.phoneError || this.dobError) return;

    this.http
      .get<{ exists: boolean }>('http://localhost:8080/api/auth/check-phone', {
        params: { phone: this.phone }
      })
      .subscribe({
        next: (response) => {
          if (response.exists) {
            this.phoneError = 'Phone number already exists';
          } else {
            this.userDetailsFilled = true;
          }
        },
        error: () => {
          this.phoneError = 'Error checking phone number. Try again.';
        }
      });
  }

  validateMpinFields(): boolean {
    this.mpinError = '';
    this.confirmMpinError = '';

    if (!/^\d{6}$/.test(this.mpin)) {
      this.mpinError = 'MPIN must be exactly 6 digits';
      return false;
    }

    const digitCount: { [key: string]: number } = {};
    for (let digit of this.mpin) {
      digitCount[digit] = (digitCount[digit] || 0) + 1;
      if (digitCount[digit] > 3) {
        this.mpinError = 'No digit can repeat more than 3 times';
        return false;
      }
    }

    if (this.mpin !== this.confirmMpin) {
      this.confirmMpinError = 'MPINs do not match';
      return false;
    }

    return true;
  }

  setMpin() {
    if (!this.validateMpinFields()) return;

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

    this.http
      .post('http://localhost:8080/api/auth/register', payload, {
        responseType: 'text'
      })
      .subscribe({
        next: (responseText) => {
            try {
                const response = JSON.parse(responseText);
                this.toastr.success(response.message || 'Account created successfully');
                this.router.navigate(['login']);
            } catch (e) {
                if (responseText === 'Email already exists') {
                    this.emailError = 'Email already exists';
                } else {
                    this.toastr.success(responseText);
                    this.router.navigate(['login']);
                }
            }
        },
        error: (err) => {
          console.error(err);
          try {
            const errorResponse = JSON.parse(err.error);
            if (errorResponse.message) {
                this.toastr.error(errorResponse.message);
                if (errorResponse.error === 'EMAIL_EXISTS') {
                    this.emailError = errorResponse.message;
                }
            } else {
                this.toastr.error('Error creating account. Please try again.');
            }
          } catch(e) {
            this.toastr.error('Error creating account. Please try again.');
          }
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
