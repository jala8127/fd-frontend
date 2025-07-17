import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-schemes',
  standalone: true,
  templateUrl: './admin-schemes.component.html',
  styleUrls: ['./admin-schemes.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AdminSchemesComponent implements OnInit {
  cumulativeSchemes: any[] = [];
  nonCumulativeSchemes: any[] = [];

  selectedScheme: any = null;
  showModal: boolean = false;
  isViewMode: boolean = false;

  seniorRateMode: 'COMMON' | 'INDIVIDUAL' = 'COMMON';
  commonSeniorRate: number = 0;
  individualSeniorRates: { [schemeId: number]: number } = {};

  showPenaltyModal: boolean = false;
  penaltyRate: number = 1.0;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadSchemes();
  }

  get allSchemes(): any[] {
    return [...this.cumulativeSchemes, ...this.nonCumulativeSchemes];
  }

  loadSchemes(): void {
    this.http.get<any[]>('http://localhost:8080/api/schemes/all').subscribe(data => {
      data.forEach(s => {
        s.isActive = s.active === true || s.active === 'true';
      });
      this.cumulativeSchemes = data.filter(s => s.schemeType === 'CUMULATIVE');
      this.nonCumulativeSchemes = data.filter(s => s.schemeType === 'NON_CUMULATIVE');
    });
  }

  openAddModal(): void {
    this.selectedScheme = {
      schemeName: '',
      interestRate: null,
      tenureMonths: null,
      minAmount: null,
      schemeType: 'CUMULATIVE',
      isActive: true,
      payout: 'On Maturity'
    };
    this.isViewMode = false;
    this.showModal = true;
  }

  openSeniorRateModal(): void {
    this.selectedScheme = null;
    this.isViewMode = false;
    this.showModal = true;

    this.seniorRateMode = 'COMMON';
    this.commonSeniorRate = 0;

    this.individualSeniorRates = {};
    this.allSchemes.forEach(s => {
      this.individualSeniorRates[s.id] = s.seniorBonusRate || 0;
    });
  }

  editScheme(scheme: any): void {
    this.selectedScheme = { ...scheme };
    this.isViewMode = false;
    this.showModal = true;
  }

  toggleStatus(scheme: any): void {
    this.http.put<any>(`http://localhost:8080/api/schemes/${scheme.id}/toggle-status`, {})
      .subscribe(() => this.loadSchemes());
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedScheme = null;
  }

  saveScheme(scheme: any): void {
    if (scheme.schemeType === 'CUMULATIVE') {
      scheme.payout = 'On Maturity';
    }

    const url = scheme.id
      ? `http://localhost:8080/api/schemes/update/${scheme.id}`
      : `http://localhost:8080/api/schemes/add`;

    const request = scheme.id
      ? this.http.put(url, scheme)
      : this.http.post(url, scheme);

    request.subscribe(() => {
      this.showModal = false;
      this.loadSchemes();
    });
  }

  handleSeniorRateSave(): void {
    const payload = this.seniorRateMode === 'COMMON'
      ? this.allSchemes.map(s => ({
          ...s,
          seniorBonusRate: this.commonSeniorRate
        }))
      : this.allSchemes.map(s => ({
          ...s,
          seniorBonusRate: this.individualSeniorRates[s.id] ?? s.seniorBonusRate
        }));

    this.http.put('http://localhost:8080/api/schemes/update-senior-rates', payload)
      .subscribe(() => {
        this.toastr.success('Senior bonus rates updated.');
        this.closeModal();
        this.loadSchemes();
      }, error => {
        console.error('Error updating senior rates:', error);
        this.toastr.error('Failed to update senior bonus rates.');
      });
  }

  openPenaltyModal(): void {
    // Optional: load current penalty rate from server
    this.http.get<number>('http://localhost:8080/api/schemes/penalty')
      .subscribe(rate => {
        this.penaltyRate = rate;
        this.showPenaltyModal = true;
      }, err => {
        this.toastr.error('Failed to load current penalty rate.');
        this.showPenaltyModal = true;
      });
  }

  savePenaltyRate(): void {
    this.http.put('http://localhost:8080/api/schemes/penalty', this.penaltyRate)
      .subscribe(() => {
        this.toastr.success(`Penalty rate saved: ${this.penaltyRate}%`);
        this.showPenaltyModal = false;
        this.loadSchemes();
      }, error => {
        console.error('Error saving penalty rate:', error);
        this.toastr.error('Failed to save penalty rate.');
      });
  }
}