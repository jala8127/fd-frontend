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

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  OnRegisterClick() {
    this.router.navigate(['/register']);
  }

  onLoginClick() {
    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.toastr.warning("Email and Password/MPIN are required.");
      return;
    }

    const isMpin = /^\d{6}$/.test(password);

    if (isMpin) {
      this.authService.loginUser(email, password).subscribe({
        next: (res: any) => {
          this.toastr.success("User Login successful");
          localStorage.setItem('user', JSON.stringify(res));
          localStorage.setItem('email', res.email);  
          this.router.navigate(['/user/user-home']);
        },
        error: (err: any) => {
          if (err.status === 404 || err.status === 401) {
            this.tryEmployeeLogin(email, password);
          } else {
            this.toastr.error("Something went wrong.");
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
        localStorage.setItem('employee', JSON.stringify(res));
        this.router.navigate(['/admin/admin-home']);  
      },
      error: () => {
        this.toastr.error("Invalid login credentials.");
      }
    });
  }

  openForgotPassword() {
    this.toastr.info("Forgot MPIN feature coming soon!");
  }
}