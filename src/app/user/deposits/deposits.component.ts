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
  selectedFd: any = null;
  showWithdrawModal = false;

  isProcessing = false;
  showLoader = false;
  paymentResult: 'SUCCESS' | 'FAILED' | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDeposits();
  }

  fetchDeposits(): void {
    this.http.get<any[]>(`http://localhost:8080/api/deposits/my-deposits`).subscribe({
      next: data => {
        this.deposits = data.filter(fd => fd.status === 'ACTIVE');
      },
      error: (err) => console.error("Failed to load FDs", err)
    });
  }

  openFdModal(fd: any) {
    this.selectedFd = fd;
    this.showWithdrawModal = false;
  }

  prepareCloseFd(fd: any) {
    if (!fd.id) {
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
      error: () => {
        alert("Unable to fetch FD preview details.");
      }
    });
  }

  get finalPayout(): number {
    return (
      (this.selectedFd?.amount || 0) +
      (this.selectedFd?.interestEarned || 0) -
      (this.selectedFd?.penality || 0)
    );
  }

  confirmWithdraw() {
    if (!this.selectedFd?.id) {
      alert("FD ID is missing!");
      return;
    }

    this.isProcessing = true;
    this.showLoader = true;
    this.paymentResult = null;

    setTimeout(() => {
     this.http.put(`http://localhost:8080/api/deposits/close/${this.selectedFd.id}`, {}).subscribe({
        next: () => {
          this.paymentResult = 'SUCCESS';
          this.showLoader = false;
          this.playSound('success');
          this.fetchDeposits();
        },
        error: (err) => {
          console.error('Withdrawal failed', err);
          this.paymentResult = 'FAILED';
          this.showLoader = false;
          this.playSound('fail');
        },
        complete: () => {
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
      .then(() => console.log(`${type} sound played`))
      .catch(err => console.error("Sound play error", err));
  }
}