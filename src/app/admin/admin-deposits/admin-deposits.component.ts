import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-deposits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-deposits.component.html',
  styleUrls: ['./admin-deposits.component.css']
})
export class AdminDepositsComponent implements OnInit {
  allDeposits: any[] = [];
  searchText: string = '';
  selectedFd: any = null;
  showDownloadModal: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllDeposits();
  }

  loadAllDeposits(): void {
    this.http.get<any[]>('http://localhost:8080/api/deposits/all').subscribe({
      next: (data) => this.allDeposits = data,
      error: (err) => console.error('Failed to load deposits', err)
    });
  }

  filteredDeposits(): any[] {
    if (!this.searchText) return this.allDeposits;

    const lowerSearch = this.searchText.toLowerCase();
    return this.allDeposits.filter(fd =>
      (fd.userName && fd.userName.toLowerCase().includes(lowerSearch)) ||
      (fd.userId && fd.userId.toString().includes(lowerSearch)) ||
      (fd.depositId && fd.depositId.toString().includes(lowerSearch))
    );
  }

  viewDetails(fd: any): void {
    this.selectedFd = fd;
  }

  downloadActiveDepositsPdf(): void {
    const activeDeposits = this.allDeposits.filter(fd => fd.status === 'ACTIVE');
    const doc = new jsPDF();
    doc.text('Active Fixed Deposits Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['FD ID', 'User Name', 'User ID', 'Amount', 'Tenure', 'Interest Rate']],
      body: activeDeposits.map(fd => [
        fd.depositId,
        fd.userName,
        fd.userId,
        `₹${fd.amount}`,
        `${fd.tenureMonths} months`,
        `${fd.interestRate}%`
      ])
    });
    doc.save('active-fixed-deposits.pdf');
    this.showDownloadModal = false;
  }
}