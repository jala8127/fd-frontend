import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastrService } from 'ngx-toastr';

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

  showConfirmCloseModal = false;
  isProcessing = false;
  showLoader = false;
  paymentResult: 'SUCCESS' | 'FAILED' | null = null;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

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
      (fd.amount && fd.amount.toString().includes(lowerSearch)) ||
      (fd.id && fd.id.toString().includes(lowerSearch))
    );
  }

  viewDetails(fd: any): void {
    this.selectedFd = fd;
  }

  prepareToCloseFd(fd: any): void {
    if (!fd || !fd.id) {
      this.toastr.error("Invalid FD record selected.");
      return;
    }

    this.http.get<any>(`http://localhost:8080/api/deposits/preview-close/${fd.id}`).subscribe({
      next: (previewData) => {
        this.selectedFd = { ...fd, ...previewData }; 
        this.showConfirmCloseModal = true;
      },
      error: (err) => {
        this.toastr.error("Could not fetch closure details. Please try again.");
        console.error(err);
      }
    });
  }

  confirmFdClosure(): void {
    if (!this.selectedFd?.id) {
      this.toastr.error("FD ID is missing. Cannot proceed.");
      return;
    }

    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;
    this.showConfirmCloseModal = false; 

    setTimeout(() => {
      this.http.put(`http://localhost:8080/api/deposits/close/${this.selectedFd.id}`, {}).subscribe({
        next: () => {
          this.paymentResult = 'SUCCESS';
          this.playSound('success');
          this.loadAllDeposits(); 
        },
        error: (err) => {
          console.error('FD closure failed', err);
          this.paymentResult = 'FAILED';
          this.playSound('fail');
        },
        complete: () => {
          this.isProcessing = false;
          this.showLoader = false;
        }
      });
    }, 1500); 
  }

  get finalPayout(): number {
    if (!this.selectedFd) return 0;
    return (
      (this.selectedFd.amount || 0) +
      (this.selectedFd.interestEarned || 0) -
      (this.selectedFd.penality || 0)
    );
  }

  closeAllModals(): void {
    this.selectedFd = null;
    this.showDownloadModal = false;
    this.showConfirmCloseModal = false;
    this.isProcessing = false;
    this.showLoader = false;
    this.paymentResult = null;
  }

  downloadActiveDepositsPdf(): void {
    const activeDeposits = this.allDeposits.filter(fd => fd.status === 'ACTIVE');
    const doc = new jsPDF();
    doc.text('Active Fixed Deposits Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['FD ID', 'User Name', 'User ID', 'Amount', 'Tenure', 'Interest Rate']],
      body: activeDeposits.map(fd => [
        fd.id,
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
  
  playSound(type: 'success' | 'fail') {
    const audio = new Audio();
    audio.src = type === 'success' ? 'assets/success.mp3' : 'assets/fail.mp3';
    audio.play().catch(err => console.error("Sound play error", err));
  }
}
