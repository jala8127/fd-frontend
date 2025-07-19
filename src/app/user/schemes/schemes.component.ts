import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

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
  private loggedInUserEmail: string | null = null;

  selectedScheme: any = null;
  investmentAmount: number = 0;
  showKycModal: boolean = false;
  userKycVerified: boolean = false;
  kycStatus: string = ''; 

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    const email = this.authService.getUserEmail();
    if (email) {
      this.loggedInUserEmail = email;
    }

    this.loadSchemes();
    this.checkKycStatus();
  }

  loadSchemes(): void {
    this.http.get<any[]>("http://localhost:8080/api/schemes/active").subscribe(data => {
      this.activeSchemes = data;
      this.cumulativeSchemes = data.filter(s => s.schemeType === 'CUMULATIVE');
      this.nonCumulativeSchemes = data.filter(s => s.schemeType === 'NON_CUMULATIVE');
    });
  }

  checkKycStatus() {
    const email = this.loggedInUserEmail;

    if (!email) return;

    this.http.get('http://localhost:8080/api/user/kyc-status?email=' + email, { responseType: 'text' })
  .subscribe({
    next: (status) => {
      console.log('KYC Status:', status);
      this.kycStatus = status;
    },
    error: (error) => {
      console.error('Error fetching KYC status', error);
    }
  });
  }

 viewScheme(scheme: any): void {
  if (this.kycStatus !== 'APPROVED') {
    this.showKycModal = true;
    this.selectedScheme = null; 
    return;
  }

  this.selectedScheme = scheme;
  this.investmentAmount = scheme.minAmount || 0;
}
  isInvestmentValid(): boolean {
    return (
      this.investmentAmount >= this.selectedScheme.minAmount &&
      this.investmentAmount <= 500000
    );
  }

    createDeposit(): void {
      if (this.kycStatus !== 'APPROVED') {
        this.showKycModal = true;
        return;
      }

      this.router.navigate(['/user/payments'], {
        state: {
          scheme: this.selectedScheme,
          investmentAmount: this.investmentAmount
        }
      });
    }

  goToKyc(): void {
    this.showKycModal = false;
    this.router.navigate(['/user/kyc']);
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
}