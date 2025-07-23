import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr'; 

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
  kycStatus: string = ''; 
  
  isLoadingKyc: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.loggedInUserEmail = this.authService.getUserEmail();
    if (this.loggedInUserEmail) {
      this.checkKycStatus(); 
    } else {
        this.toastr.error("Could not find user email. Please log in again.");
        this.isLoadingKyc = false; 
    }
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.http.get<any[]>("http://localhost:8080/api/schemes/user/active").subscribe({
        next: (data) => {
            this.activeSchemes = data;
            this.cumulativeSchemes = data.filter(s => s.schemeType === 'CUMULATIVE');
            this.nonCumulativeSchemes = data.filter(s => s.schemeType === 'NON_CUMULATIVE');
        },
        error: (err) => {
            console.error("Failed to load schemes:", err);
            this.toastr.error("Could not load investment schemes.");
        }
    });
  }

  checkKycStatus() {
    this.isLoadingKyc = true; 
    this.http.get<any>('http://localhost:8080/api/kyc/my-status').subscribe({
        next: (response) => {
          if (response && response.status) {
            this.kycStatus = response.status;
          }
          this.isLoadingKyc = false; 
        },
        error: (error) => {
          console.error('Error fetching KYC status', error);
          this.toastr.error('Could not fetch KYC status.');
          this.isLoadingKyc = false; 
        }
      });
  }

  viewScheme(scheme: any): void {
    if (this.isLoadingKyc) {
      this.toastr.info("Please wait, checking KYC status...");
      return;
    }
    
    if (this.kycStatus !== 'APPROVED') {
      this.showKycModal = true;
      this.selectedScheme = null; 
      return;
    }

    this.selectedScheme = scheme;
    this.investmentAmount = scheme.minAmount || 0;
  }

  isInvestmentValid(): boolean {
    if (!this.selectedScheme) return false;
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
    const annualRate = scheme.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const tenureMonths = scheme.tenureMonths;
    
    const amount = principal * Math.pow(1 + monthlyRate, tenureMonths);
    return Math.round(amount);
  }

  calculateCumulativeInterest(scheme: any): number {
    const maturityAmount = this.calculateMaturityAmount(scheme);
    return maturityAmount - this.investmentAmount;
  }

  calculateTotalNonCumulativeInterest(scheme: any): number {
    const principal = this.investmentAmount;
    const annualRate = scheme.interestRate / 100;
    const tenureInYears = scheme.tenureMonths / 12;
    const totalInterest = principal * annualRate * tenureInYears;
    return Math.round(totalInterest);
  }

  calculateInterestPerPayout(scheme: any): number {
    const principal = this.investmentAmount;
    const annualRate = scheme.interestRate / 100;
    let interestPerPayout = 0;

    const payoutType = scheme.payout.toUpperCase().replace(/[\s_]/g, '-');

    switch (payoutType) {
      case 'MONTHLY':
        interestPerPayout = (principal * annualRate) / 12;
        break;
      case 'QUARTERLY':
        interestPerPayout = (principal * annualRate) / 4;
        break;
      case 'HALF-YEARLY':
        interestPerPayout = (principal * annualRate) / 2;
        break;
      case 'ANNUALLY':
        interestPerPayout = principal * annualRate;
        break;
      default:
        interestPerPayout = 0; 
        break;
    }
    return Math.round(interestPerPayout);
  }
}