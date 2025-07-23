import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms'; // Import Validators
import { CommonModule } from '@angular/common';
import { Customer, CustomerService } from '../../service/customer.service';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  activeTab = 'personal';
  personalForm!: FormGroup;
  isEditing: { [key: string]: boolean } = {};
  formFields: any[] = [];
  private originalUserData: any = {};

  changeMpinForm!: FormGroup;
  forgotMpinForm!: FormGroup;
  forgotMpinStep: 'email' | 'otp' = 'email'; 

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    this.changeMpinForm = this.fb.group({
      currentMpin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newMpin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      confirmNewMpin: ['', [Validators.required]]
    });

    this.forgotMpinForm = this.fb.group({
      email: [{ value: '', disabled: true }], 
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newMpin: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      confirmNewMpin: ['', [Validators.required]]
    });
  }

  loadUserData() {
    this.customerService.getLoggedInUserDetails().subscribe({
      next: (user: Customer) => {
        if (!user) {
          console.error("Service returned no user data.");
          return;
        }
        
        this.personalForm = this.fb.group({
          name: [{ value: user.name, disabled: true }],
          phone: [user.phone],
          dob: [{ value: user.dob, disabled: true }],
          address: [user.address],
          panNo: [{ value: user.panNo, disabled: true }],
          status: [{ value: user.status, disabled: true }],
          activeFd: [{ value: user.activeFd, disabled: true }],
          bankName: [user.bankName || ''],
          bankAccNo: [user.bankAccNo || ''],
          bankIfsc: [user.bankIfsc || '']
        });

        this.originalUserData = this.personalForm.getRawValue();
        this.setupFormFields();

        this.forgotMpinForm.patchValue({ email: user.email });

        Object.keys(this.personalForm.controls).forEach(key => {
          this.isEditing[key] = false;
        });
      },
      error: (err) => {
        console.error("Error fetching user profile:", err);
        this.toastr.error('Failed to load user data.');
      }
    });
  }

  setupFormFields() {
    const fieldOrder = [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'address', label: 'Address' },
      { key: 'panNo', label: 'PAN Number' },
      { key: 'status', label: 'KYC Status' },
      { key: 'activeFd', label: 'Active FDs' },
      { key: 'bankName', label: 'Bank Name' },
      { key: 'bankAccNo', label: 'Bank Account No.' },
      { key: 'bankIfsc', label: 'Bank IFSC Code' }
    ];

    this.formFields = fieldOrder.map(field => {
      return {
        key: field.key,
        label: field.label,
        control: this.personalForm.get(field.key) as FormControl
      };
    });
  }

  enableEdit(fieldKey: string) {
    if (this.personalForm.controls[fieldKey].disabled) return;
    this.isEditing[fieldKey] = true;
  }

  cancelEdit(fieldKey: string) {
    this.personalForm.get(fieldKey)?.reset(this.originalUserData[fieldKey]);
    this.isEditing[fieldKey] = false;
  }

  saveField(fieldKey: string) {
    const control = this.personalForm.get(fieldKey);
    if (!control || !control.dirty || control.invalid) {
      this.isEditing[fieldKey] = false;
      return;
    }
    const updatedValue = control.value;
    this.customerService.updateUserField(fieldKey, updatedValue).subscribe({
      next: () => {
        this.toastr.success(`'${fieldKey}' updated successfully!`);
        this.originalUserData[fieldKey] = updatedValue;
        control.markAsPristine();
        this.isEditing[fieldKey] = false;
      },
      error: (err) => {
        console.error(`Error updating ${fieldKey}:`, err);
        this.toastr.error(`Failed to update ${fieldKey}. Reverting changes.`);
        this.cancelEdit(fieldKey);
      }
    });
  }

  onChangeMpinSubmit() {
    if (this.changeMpinForm.valid) {
      console.log("Change MPIN form submitted:", this.changeMpinForm.value);
      this.toastr.info("Backend for changing MPIN is not yet implemented.");
    }
  }

  onForgotMpinSendOtp() {
    console.log("Sending OTP to:", this.forgotMpinForm.get('email')?.value);
    this.toastr.info("Backend for sending OTP is not yet implemented.");
    this.forgotMpinStep = 'otp';
  }

  onForgotMpinReset() {
    if (this.forgotMpinForm.valid) {
      console.log("Forgot MPIN form submitted:", this.forgotMpinForm.value);
      this.toastr.info("Backend for resetting MPIN is not yet implemented.");
    }
  }
}