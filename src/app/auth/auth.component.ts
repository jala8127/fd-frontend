import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service'; 
import { EmployeeService } from '../service/employee.service'; 

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isSignUp = false;
  email = '';
  showPassword = false;
  password = '';
  invalidEmail = false;
  name = '';
  phone = '';
  dob = '';
  mpin = '';
  confirmMpin = '';
  otp = '';
  generatedOtp = '';
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

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

  onLoginClick() {
    const email = this.email.trim();
    const password = this.password.trim();
    if (!email || !password) {
      this.toastr.warning("Email and Password/MPIN are required.");
      return;
    }
    if (!this.validateEmail(email)) {
      this.invalidEmail = true;
      this.toastr.error("Invalid email format.");
      return;
    }
    this.invalidEmail = false;
    const isMpin = /^\d{6}$/.test(password);
    if (isMpin) {
      this.authService.loginUser(email, password).subscribe({
        next: (res: any) => {
          this.toastr.success("User Login successful");
          if (res && res.token) {
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('user', JSON.stringify(res));
            localStorage.setItem('email', res.email);
            this.router.navigate(['/user/user-home']);
          } else {
            this.toastr.error("Login successful, but no token was received.");
          }
        },
        error: (err: any) => {
          if (err.status === 404 || err.status === 401) {
            this.tryEmployeeLogin(email, password);
          } else {
            this.toastr.error("Invalid login credentials.");
          }
        }
      });
    } else {
      this.tryEmployeeLogin(email, password);
    }
  }

  private tryEmployeeLogin(email: string, password: string) {
    this.authService.loginEmployee(email, password).subscribe({
      next: (res: any) => {
        this.toastr.success("Employee Login successful");
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('employee', JSON.stringify(res));
          localStorage.setItem('email', res.email);
          this.router.navigate(['/admin/admin-home']);
        } else {
          this.toastr.error("Login successful, but no token was received.");
        }
      },
      error: () => {
        this.toastr.error("Invalid login credentials for employee.");
      }
    });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z]+\.[a-z]{2,}$/;
    return emailRegex.test(email);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    this.invalidEmail = this.email.trim() !== '' && !this.validateEmail(this.email);
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
    this.http.post<{ otp: string, message: string }>('http://localhost:8080/api/auth/send-otp', null, { params: { email: this.email } })
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
    this.http.get<{ exists: boolean }>('http://localhost:8080/api/auth/check-phone', { params: { phone: this.phone } })
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
    this.http.post('http://localhost:8080/api/auth/register', payload, { responseType: 'text' })
      .subscribe({
        next: (responseText) => {
          this.toastr.success('Account created successfully! Please sign in.');
          this.resetRegisterForm();
          this.isSignUp = false; 
        },
        error: (err) => {
          this.toastr.error('Error creating account. Please try again.');
        }
      });
  }
  
  resetRegisterForm() {
      this.name = '';
      this.phone = '';
      this.dob = '';
      this.mpin = '';
      this.confirmMpin = '';
      this.otp = '';
      this.otpSent = false;
      this.otpVerified = false;
      this.userDetailsFilled = false;
      this.mpinSet = false;

      this.nameError = '';
      this.phoneError = '';
      this.dobError = '';
      this.mpinError = '';
      this.confirmMpinError = '';
  }
  showForgotPasswordModal = false;
  forgotPasswordStep = 1; // 1: enter details, 2: verify email, 3: verify sms, 4: reset mpin, 5: success
  resetEmail = '';
  resetPhone = '';
  resetOtp = '';
  newMpin = '';
  confirmNewMpin = '';
  resetError = '';
  private apiUrl = 'http://localhost:8080/api/otp'; // Your OTP backend URL

  
  openForgotPassword() {
    this.showForgotPasswordModal = true;
  }

  closeForgotPassword() {
    this.showForgotPasswordModal = false;
    // Reset state when closing
    this.forgotPasswordStep = 1;
    this.resetEmail = '';
    this.resetPhone = '';
    this.resetOtp = '';
    this.newMpin = '';
    this.confirmNewMpin = '';
    this.resetError = '';
  }

  sendResetEmailOtp() {
    this.resetError = '';
    // NOTE: You should first check if the email and phone exist in your DB.
    // This requires a new backend endpoint. For now, we'll just send the OTP.
    this.http.post(`${this.apiUrl}/send-email`, null, { params: { email: this.resetEmail } }).subscribe({
      next: () => {
        this.toastr.success('Email OTP Sent!');
        this.forgotPasswordStep = 2; // Move to next step
      },
      error: () => this.resetError = 'Failed to send email OTP. Please try again.'
    });
  }

  verifyResetEmailOtp() {
    this.resetError = '';
    this.http.post<any>(`${this.apiUrl}/verify-otp`, null, { params: { key: this.resetEmail, otp: this.resetOtp } }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.toastr.success('Email Verified! Sending SMS OTP...');
          this.resetOtp = ''; // Clear OTP field for the next one
          this.sendResetSmsOtp();
        } else {
          this.resetError = 'Invalid Email OTP.';
        }
      },
      error: () => this.resetError = 'Error verifying email OTP.'
    });
  }

  sendResetSmsOtp() {
    this.http.post(`${this.apiUrl}/send-sms`, null, { params: { phoneNumber: this.resetPhone } }).subscribe({
      next: () => {
        this.forgotPasswordStep = 3; // Move to SMS verification step
      },
      error: () => this.resetError = 'Failed to send SMS OTP.'
    });
  }

  verifyResetSmsOtp() {
    this.resetError = '';
    this.http.post<any>(`${this.apiUrl}/verify-otp`, null, { params: { key: this.resetPhone, otp: this.resetOtp } }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.toastr.success('Phone Verified! Please set your new MPIN.');
          this.resetOtp = '';
          this.forgotPasswordStep = 4; // Move to password reset step
        } else {
          this.resetError = 'Invalid Phone OTP.';
        }
      },
      error: () => this.resetError = 'Error verifying phone OTP.'
    });
  }

  updatePassword() {
    this.resetError = '';
    if (!/^\d{6}$/.test(this.newMpin)) {
        this.resetError = 'New MPIN must be exactly 6 digits.';
        return;
    }
    if (this.newMpin !== this.confirmNewMpin) {
        this.resetError = 'MPINs do not match.';
        return;
    }

    // IMPORTANT: You need a new backend endpoint for this.
    // Example: POST /api/auth/reset-password with { email: this.resetEmail, newMpin: this.newMpin }
    /*
    this.http.post('http://localhost:8080/api/auth/reset-password', { email: this.resetEmail, newMpin: this.newMpin }).subscribe({
        next: () => {
            this.forgotPasswordStep = 5; // Move to success step
        },
        error: () => this.resetError = 'Failed to update password. Please try again.'
    });
    */
    // For now, we'll just simulate success:
    this.forgotPasswordStep = 5;
  }
}
