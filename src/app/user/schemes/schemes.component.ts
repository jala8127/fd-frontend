import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schemes',
  standalone: true,
  templateUrl: './schemes.component.html',
  styleUrls: ['./schemes.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SchemesComponent implements OnInit {
  activeSchemes: any[] = [];
  cumulativeSchemes: any[] = [];
  nonCumulativeSchemes: any[] = [];

  selectedScheme: any = null;
  investmentAmount: number = 0;

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.loadSchemes();

  }

  loadSchemes(): void {
    this.http.get<any[]>("http://localhost:8080/api/schemes/active").subscribe(data => {
      this.activeSchemes = data;
      this.cumulativeSchemes = data.filter(s => s.schemeType === 'CUMULATIVE');
      this.nonCumulativeSchemes = data.filter(s => s.schemeType === 'NON_CUMULATIVE');
    });
  }

  viewScheme(scheme: any): void {
    this.selectedScheme = scheme;
    this.investmentAmount = 0;
  }

  calculateMaturityAmount(scheme: any): number {
    const principal = this.investmentAmount;
    const rate = scheme.interestRate;
    const time = scheme.tenureMonths / 12;
    const amount = principal * Math.pow((1 + rate / 100), time);
    return Math.round(amount);
  }

  calculateNonCumulativeInterest(scheme: any): number {
    const principal = this.investmentAmount;
    const rate = scheme.interestRate;
    const time = scheme.tenureMonths / 12;
    const interest = principal * rate * time / 100;
    return Math.round(interest);
  }

  createDeposit(): void {
  this.router.navigate(['/user/payments'], {
    state: { 
      scheme: this.selectedScheme, 
      investmentAmount: this.investmentAmount 
    }
  });
}
}