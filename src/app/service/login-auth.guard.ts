import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    if (this.authService.isLoggedIn()) {

      const user = localStorage.getItem('user');
      const employee = localStorage.getItem('employee');

      if (user) {
        this.router.navigate(['/user/user-home']);
      } else if (employee) {
        this.router.navigate(['/admin/admin-home']);
      } else {

        this.router.navigate(['/user/user-home']);
      }
      return false; 
    } else {

      return true;
    }
  }
}
