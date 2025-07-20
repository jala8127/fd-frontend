import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerService, Customer } from '../../service/customer.service'; 

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
 animations: [
  trigger('slideFromTopRight', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translate(100%, -100%)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translate(0, 0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translate(100%, -100%)' }))
    ])
  ])
]})
export class UserDashboardComponent implements OnInit {

  selected = 'dashboard';
  showModal = false;
  user: Customer | null = null;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private customerService: CustomerService 
  ) {}

  ngOnInit(): void {
    this.customerService.getLoggedInUserDetails().subscribe({
      next: (userData) => {
        if (userData) {
          this.user = userData;
          console.log("Successfully fetched user for dashboard:", this.user);
        } else {
          this.toastr.error("Failed to retrieve user details.");
          this.logout(); 
        }
      },
      error: (err) => {
        console.error("Error fetching user details for dashboard:", err);
        this.toastr.error("Your session may have expired. Please log in again.");
        this.logout(); 
      }
    });
  }

  onProfileClick(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  select(menu: string): void {
    this.selected = menu;
  }

  onSearchClick(): void {
    console.log('Search clicked');
  }

  onNotificationClick(): void {
    console.log('Notification clicked');
  }

  logout(): void {
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
    localStorage.removeItem('email'); 
    this.toastr.success("Logout successful");
    this.router.navigate(['/login']);
  }
}
