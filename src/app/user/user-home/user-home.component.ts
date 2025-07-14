import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  summary: any = null;
  interestSchemes: any[] = [];

  features = [
    {
      icon: 'fas fa-piggy-bank',
      title: 'Safe & Secure',
      description: 'Your investments are protected and insured.'
    },
    {
      icon: 'fas fa-percentage',
      title: 'Attractive Interest',
      description: 'Up to 8.5% interest p.a. on your deposits.'
    },
    {
      icon: 'fas fa-clock',
      title: 'Flexible Tenures',
      description: 'Choose between short or long-term FDs.'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Instant Withdrawal',
      description: 'Withdraw your funds anytime without hassle.'
    }
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const email = this.authService.getUserEmail();

    this.http.get<any>(`http://localhost:8080/api/deposits/summary/${email}`).subscribe({
      next: (data) => (this.summary = data),
      error: (err) => console.error('Failed to load summary:', err)
    });

    this.loadInterestRates();
  }

loadInterestRates(): void {
  this.http.get<any[]>('http://localhost:8080/api/schemes/all').subscribe({
    next: (data) => {
      this.interestSchemes = data.filter(
        (s) => ['B1', 'B3', 'B4'].includes(s.schemeName)
      );
    },
    error: (err) => console.error('Failed to load interest rates:', err)
  });
}
}