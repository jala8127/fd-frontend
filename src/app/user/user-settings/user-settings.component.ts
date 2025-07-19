import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../service/customer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  activeTab = 'personal';
  personalForm!: FormGroup;
  isEditing: { [key: string]: boolean } = {};

  constructor(private customerService: CustomerService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    this.customerService.getLoggedInUserDetails().subscribe(user => {
      this.personalForm = this.fb.group({
        name: [{ value: user.name, disabled: true }],
        phone: [user.phone],
        dob: [{ value: user.dob, disabled: true }],
        address: [user.address],
        panNo: [{ value: user.panNo, disabled: true }],
        status: [{ value: user.status, disabled: true }],
        activeFds: [{ value: user.activeFds, disabled: true }],
        bankName: [user.bankName],
        bankAccNo: [user.bankAccNo],
        bankIfsc: [user.bankIfsc]
      });
    });
  }

  enableEdit(field: string) {
    if (this.personalForm.controls[field].disabled) return;
    this.isEditing[field] = true;
  }

  saveField(field: string) {
    this.isEditing[field] = false;

    const updatedValue = this.personalForm.getRawValue();
    this.customerService.updateUserField(field, updatedValue[field]).subscribe(() => {
      console.log(`${field} updated`);
    });
  }
}