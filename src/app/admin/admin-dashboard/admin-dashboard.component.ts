import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule,RouterModule],
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
export class AdminDashboardComponent implements OnInit {

  constructor(private router: Router,private toastr: ToastrService) {}

  selected = 'dashboard';
  showModal = false;
  employee: any = null;

 ngOnInit(): void {
  const storedEmployee = localStorage.getItem('employee');
  if (storedEmployee) {
    this.employee = JSON.parse(storedEmployee);
  }
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
  localStorage.removeItem('emplyee');
  localStorage.clear(); 
  this.toastr.success("Logout successful");
  this.router.navigate(['/login']);
}
}
