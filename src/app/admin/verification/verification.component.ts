import { Component, OnInit } from '@angular/core';
import { KycService } from '../../service/kyc.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
  pendingKycs: any[] = [];
  selectedKyc: any = null;

  constructor(private kycService: KycService) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.kycService.getPendingKycs().subscribe(data => this.pendingKycs = data);
  }

  view(kyc: any) {
    this.selectedKyc = { ...kyc };
  }

  verify(status: string, reason?: string) {
    const payload = { status, rejectionReason: reason || null };
    this.kycService.verifyKyc(this.selectedKyc.id, payload).subscribe(() => {
      this.selectedKyc = null;
      this.loadPending();
    });
  }
}
