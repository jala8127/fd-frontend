import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deposits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.css']
})
export class DepositsComponent implements OnInit {
  deposits: any[] = []; 
  closedDeposits: any[] = []; 
  currentView: 'active' | 'closed' = 'active'; 

  selectedFd: any = null;
  showWithdrawModal = false;
  isProcessing = false;
  showLoader = false;
  paymentResult: 'SUCCESS' | 'FAILED' | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllDeposits();
  }

  fetchAllDeposits(): void {
    this.http.get<any[]>(`http://localhost:8080/api/deposits/my-deposits`).subscribe({
      next: data => {
        this.deposits = data.filter(fd => fd.status === 'ACTIVE');
        this.closedDeposits = data.filter(fd => fd.status === 'CLOSED');
      },
      error: (err) => console.error("Failed to load deposits", err)
    });
  }

  switchView(view: 'active' | 'closed'): void {
    this.currentView = view;
  }

  openFdModal(fd: any) {
    this.selectedFd = fd;
    this.showWithdrawModal = false; 
  }

  prepareCloseFd(fd: any) {
    if (!fd.id) {
      console.error("Invalid FD record: Missing ID");
      alert("Invalid FD record: Missing ID");
      return;
    }

    this.http.get<any>(`http://localhost:8080/api/deposits/preview-close/${fd.id}`).subscribe({
      next: (res) => {
        this.selectedFd = {
          ...fd,
          ...res,
          penality: res.penality ?? 0
        };
        this.showWithdrawModal = true;
      },
      error: (err) => {
        console.error("Unable to fetch FD preview details.", err);
        alert("Unable to fetch FD preview details.");
      }
    });
  }

  get finalPayout(): number {
    if (!this.selectedFd) return 0;
    return this.selectedFd.earlyPayout || 0;
  }

  confirmWithdraw() {
    if (!this.selectedFd?.id) {
      alert("FD ID is missing!");
      return;
    }

    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;
    this.showWithdrawModal = false; 

    setTimeout(() => {
     this.http.put(`http://localhost:8080/api/deposits/close/${this.selectedFd.id}`, {}).subscribe({
        next: () => {
          this.paymentResult = 'SUCCESS';
          this.playSound('success');
          this.fetchAllDeposits(); 
        },
        error: (err) => {
          console.error('Withdrawal failed', err);
          this.paymentResult = 'FAILED';
          this.playSound('fail');
        },
        complete: () => {
          this.showLoader = false;
          this.isProcessing = false;
        }
      });
    }, 2000);
  }

  closeModal() {
    this.selectedFd = null;
    this.showWithdrawModal = false;
    this.paymentResult = null;
    this.showLoader = false;
    this.isProcessing = false;
  }

  playSound(type: 'success' | 'fail') {
    const audio = new Audio();
    audio.src = type === 'success' ? 'assets/success.mp3' : 'assets/fail.mp3';
    audio.play()
      .catch(err => console.error("Sound play error: User interaction may be required.", err));
  }
}
