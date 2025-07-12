import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';

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
  ]
})
export class UserDashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  selected = 'dashboard';
  showModal = false;
  user: any = null;

 ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
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
  localStorage.removeItem('user'); 
  localStorage.removeItem('email'); 
  this.toastr.success("Logout successful");
  this.router.navigate(['/login']);
}
}