import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CustomerService, Customer, FdAccount } from '../../service/customer.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerFds: FdAccount[] = [];

  selectedCustomer: Customer = {
    userId: undefined,
    name: '',
    email: '',
    phone: '',
    dob: '',
    mpin: '',
    panNo: '',
    status: '',
    address: ''
  };

  searchTerm: string = '';
  isViewMode: boolean = false;
  isLoadingFds: boolean = false; 


  constructor(private customerService: CustomerService,
    private http: HttpClient,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  loadCustomers(): void {
  this.customerService.getAllCustomers().subscribe({
    next: (data) => {
      this.customers = data;
    },
    error: (err) => {
      console.error('Error loading customers:', err);
    }
  });
}

  getCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (data: Customer[]) => {
        this.customers = data;
        this.filteredCustomers = [...data];
      },
      error: (err: any) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  filterCustomers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(cust =>
      cust.name?.toLowerCase().includes(term) ||
      cust.email?.toLowerCase().includes(term) ||
      cust.phone?.toLowerCase().includes(term)
    );
  }

  openAddModal() {
    this.selectedCustomer = {
      userId: undefined,
      name: '',
      email: '',
      phone: '',
      dob: '',
      mpin: '',
      panNo: '',
      status: '',
      address: ''
    };
    this.isViewMode = false;
    const modal = document.getElementById('addCustomerModal');
    modal && new bootstrap.Modal(modal).show();
  }

  openViewModal(customer: Customer) {
    this.selectedCustomer = { ...customer };
    this.isViewMode = true;
    this.isLoadingFds = true; 
    this.customerFds = []; 

    const modal = document.getElementById('viewCustomerModal');
    modal && new bootstrap.Modal(modal).show();
    if (customer.userId) {
      this.customerService.getFdsByUserId(customer.userId).subscribe({
        next: (fds) => {
          this.customerFds = fds;
          this.isLoadingFds = false; // Hide loading spinner
        },
        error: (err) => {
          console.error('Failed to load FD details:', err);
          this.toastr.error('Could not load FD details for this customer.');
          this.isLoadingFds = false; // Hide loading spinner on error
        }
      });
    } else {
        this.isLoadingFds = false; // No user ID to fetch with
        this.toastr.warning('Cannot fetch FDs: Customer ID is missing.');
    }
  }

  closeModal() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => bootstrap.Modal.getInstance(modal)?.hide());
    this.customerFds = [];
  }

  saveCustomer() {
    this.customerService.addCustomer(this.selectedCustomer).subscribe({
      next: (newCust: Customer) => {
        this.customers.push(newCust);
        this.filterCustomers();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('Error adding customer:', err);
      }
    });
  }

 closeCustomerAccount() {
  const userId = this.selectedCustomer.userId;

  this.http.put(`http://localhost:8080/api/user/users/${userId}/soft-delete`, {}, { responseType: 'text' })
    .subscribe({
      next: (message) => {
        this.toastr.success(message);
        this.closeModal();
        this.loadCustomers(); 
      },
      error: (error) => {
        if (error.status === 409) {
          this.toastr.warning('User has an active FD account');
        } else if (error.status === 404) {
          this.toastr.error('User not found');
        } else {
          this.toastr.error('Something went wrong');
        }
      }
    });
}
get activeFds(): FdAccount[] {
    return this.customerFds.filter(fd => fd.status === 'ACTIVE');
  }

  get closedFds(): FdAccount[] {
    return this.customerFds.filter(fd => fd.status === 'CLOSED');
  }
}