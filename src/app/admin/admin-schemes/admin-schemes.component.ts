import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SchemeModalComponent } from '../scheme-modal/scheme-modal.component';

@Component({
  selector: 'app-admin-schemes',
  standalone: true,
  templateUrl: './admin-schemes.component.html',
  styleUrls: ['./admin-schemes.component.css'],
  imports: [CommonModule, FormsModule, SchemeModalComponent]
})
export class AdminSchemesComponent implements OnInit {
  cumulativeSchemes: any[] = [];
  nonCumulativeSchemes: any[] = [];
  selectedScheme: any = null;
  showModal = false;
  isViewMode = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
  this.http.get<any[]>('http://localhost:8080/api/schemes/all').subscribe(data => {
    data.forEach(s => s.isActive = s.isActive === true || s.isActive === 'true');
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

  viewScheme(scheme: any): void {
    this.selectedScheme = { ...scheme };
    this.isViewMode = true;
    this.showModal = true;
  }

  editScheme(scheme: any): void {
    this.selectedScheme = { ...scheme };
    this.isViewMode = false;
    this.showModal = true;
  }

  toggleStatus(scheme: any): void {
  this.http.put<any>(`http://localhost:8080/api/schemes/${scheme.id}/toggle-status`, {})
    .subscribe(
      updated => {
        console.log('Status updated:', updated);

        const list = scheme.schemeType === 'CUMULATIVE' 
          ? this.cumulativeSchemes 
          : this.nonCumulativeSchemes;

        const index = list.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          list[index] = { ...updated };
        }
      },
      error => {
        console.error('Toggle failed:', error);
      }
    );
}
  closeModal(): void {
    this.showModal = false;
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
}