import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService, Employee } from '../../service/employee.service'; 
import { InactivityService } from '../../service/inactivity.service'; 
import { Subscription } from 'rxjs'; 
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-admin-dashboard', 
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
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
  ]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  selected = 'dashboard';
  showModal = false;
  employee: Employee | null = null;
  private inactivitySubscription!: Subscription;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private inactivityService: InactivityService ,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.inactivityService.startMonitoring();
    this.inactivitySubscription = this.inactivityService.getInactivityLogout().subscribe(() => {
      this.logout();
    });

    this.employeeService.getLoggedInEmployeeProfile().subscribe({
      next: (employeeData) => {
        if (employeeData) {
          this.employee = employeeData;
        } else {
          this.toastr.error("Failed to retrieve employee details.");
          this.logout(); 
        }
      },
      error: (err) => {
        console.error("Error fetching employee details for dashboard:", err);
        this.toastr.error("Your session may have expired. Please log in again.");
        this.logout(); 
      }
    });
  }

  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
    if (this.inactivitySubscription) {
      this.inactivitySubscription.unsubscribe();
    }
  }
  
  logout(): void {
    this.authService.logout();
  }

  onProfileClick(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}