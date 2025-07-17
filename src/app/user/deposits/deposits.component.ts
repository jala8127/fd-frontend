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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    this.http.get<any[]>(`http://localhost:8080/api/deposits/all`).subscribe({
      next: data => {
        this.deposits = data.filter(fd => fd.userEmail === email && fd.status === 'ACTIVE');
      },
      error: () => console.error("Failed to load FDs")
    });
  }

  openFdModal(fd: any) {
    this.selectedFd = fd;
    this.showWithdrawModal = false;
  }

  prepareCloseFd(fd: any) {
  console.log("FD clicked for closure:", fd);
  console.log("FD ID:", fd.id);  

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

    this.http.put<any>(`http://localhost:8080/api/deposits/close/${this.selectedFd.id}`, {}).subscribe({
      next: (res) => {
        this.showWithdrawModal = false;
        this.selectedFd = null;

        this.deposits = this.deposits.map(fd =>
          fd.id === res.id ? { ...fd, status: 'CLOSED', closeDate: res.closeDate } : fd
        ).filter(fd => fd.status === 'ACTIVE');
      },
      error: () => {
        alert('Failed to close FD');
      }
    });
  }

  closeModal() {
    this.selectedFd = null;
    this.showWithdrawModal = false;
  }
}