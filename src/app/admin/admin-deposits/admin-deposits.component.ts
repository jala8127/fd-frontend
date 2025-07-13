import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-deposits',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './admin-deposits.component.html',
  styleUrls: ['./admin-deposits.component.css']
})
export class AdminDepositsComponent implements OnInit {
  allDeposits: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllDeposits();
  }

loadAllDeposits() {
  this.http.get<any[]>('http://localhost:8080/api/deposits/all')
    .subscribe({
      next: (data) => {
        this.allDeposits = data;
      },
      error: (err) => {
        console.error('Failed to load deposits', err);
      }
    });
}
}