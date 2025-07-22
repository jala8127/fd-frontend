import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { EmployeeService } from '../../service/employee.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword = false;
  invalidEmail: boolean = false;

  constructor(
    private router: Router,
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

            sessionStorage.setItem('authToken', res.token); 
            sessionStorage.setItem('user', JSON.stringify(res));
            sessionStorage.setItem('email', res.email);  
            this.router.navigate(['/user/user-home']);
          } else {
            this.toastr.error("Login successful, but no token was received from the server.");
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
    this.employeeService.loginEmployee(email, password).subscribe({
      next: (res: any) => {
        this.toastr.success("Employee Login successful");

        if (res && res.token) {
            sessionStorage.setItem('authToken', res.token);
            sessionStorage.setItem('employee', JSON.stringify(res));
            this.router.navigate(['/admin/admin-home']);  
        } else {
            this.toastr.error("Login successful, but no token was received from the server.");
        }
      },
      error: () => {
        this.toastr.error("Invalid login credentials.");
      }
    });
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z]+\.[a-z]{2,}$/;
    return emailRegex.test(email);
  }

  onEmailChange() {
    this.invalidEmail = this.email.trim() !== '' && !this.validateEmail(this.email);
  }

  checkEmailExistsBeforeRegister(event: Event) {
    event.preventDefault(); 
    const emailToCheck = this.email.trim();

    if (!emailToCheck) {
      this.router.navigate(['/register']);
      return;
    }

    if (!this.validateEmail(emailToCheck)) {
      this.invalidEmail = true;
      this.toastr.error("Invalid email format.");
      return;
    }
    this.invalidEmail = false;

    this.authService.checkEmailExists(emailToCheck).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.toastr.warning("This email is already registered. Please login instead.");
        } else {
          this.router.navigate(['/register']);
        }
      },
      error: () => {
        this.toastr.error("Error checking email availability.");
      }
    });
  }

  openForgotPassword() {
    this.toastr.info("Forgot MPIN feature coming soon!");
  }
}
