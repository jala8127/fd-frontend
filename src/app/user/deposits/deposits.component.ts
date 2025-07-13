import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deposits',
  standalone:true,
  imports:[CommonModule,FormsModule],
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
  this.http.get<any[]>(`http://localhost:8080/api/deposits/user/${email}`).subscribe({
    next: data => this.deposits = data,
    error: () => console.error("Failed to load FDs")
  });
}

  openFdModal(fd: any) {
    this.selectedFd = fd;
    this.showWithdrawModal = false;
  }

  prepareCloseFd() {
    this.showWithdrawModal = true;
  }

  confirmWithdraw() {
    this.http.post(`http://localhost:8080/api/fds/close/${this.selectedFd.id}`, {}).subscribe({
      next: () => {
        this.deposits = this.deposits.filter(fd => fd.id !== this.selectedFd.id);
        this.selectedFd = null;
        this.showWithdrawModal = false;
      },
      error: () => alert('Failed to close FD')
    });
  }

  closeModal() {
    this.selectedFd = null;
  }
}