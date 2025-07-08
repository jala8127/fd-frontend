import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router,private toastr: ToastrService) {}

onLoginClick() {
  const mpin = this.mpin;

  // 1. Check if MPIN is exactly 6 digits
 const isValidFormat = /^\d{6}$/.test(mpin);
  if (!isValidFormat) {
    this.toastr.warning("MPIN must be exactly 6 digits.");
  }

  // 2. Check for more than 3 repeated digits
  const digitCount: { [key: string]: number } = {};
  for (let digit of mpin) {
    digitCount[digit] = (digitCount[digit] || 0) + 1;
    if (digitCount[digit] > 3) {
      this.toastr.warning('MPIN cannot have any digit repeated more than 3 times.');
    }
  }

  // Proceed with login
  if (this.email === "jala@admin.com" && mpin === "123456") {
    this.router.navigate(['/admin/admin-dashboard']);
  } else {
    this.router.navigate(['/user/user-dashboard']);
  }
}
openForgotPassword() {
throw new Error('Method not implemented.');
}
  email: string = '';
  mpin: string = '';
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  OnRegisterClick(){
     this.router.navigate(['/register']);
  }

  loginUser() {

  }
}
