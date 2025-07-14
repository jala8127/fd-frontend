import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-deposits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-deposits.component.html',
  styleUrls: ['./admin-deposits.component.css']
})
export class AdminDepositsComponent implements OnInit {
  allDeposits: any[] = [];
  showDownloadModal: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllDeposits();
  }

  loadAllDeposits(): void {
    this.http.get<any[]>('http://localhost:8080/api/deposits/all').subscribe({
      next: (data) => {
        this.allDeposits = data;
      },
      error: (err) => {
        console.error('Failed to load deposits', err);
      }
    });
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