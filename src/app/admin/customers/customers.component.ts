import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomerService, Customer } from '../../service/customer.service';

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
  selectedCustomer: Customer = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };
  searchTerm: string = '';
  isViewMode: boolean = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.getCustomers();
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
      name: '',
      email: '',
      phone: '',
      address: ''
    };
    this.isViewMode = false;
    const modal = document.getElementById('addCustomerModal');
    modal && new bootstrap.Modal(modal).show();
  }

  openViewModal(customer: Customer) {
    this.selectedCustomer = { ...customer };
    this.isViewMode = true;
    const modal = document.getElementById('viewCustomerModal');
    modal && new bootstrap.Modal(modal).show();
  }

  closeModal() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => bootstrap.Modal.getInstance(modal)?.hide());
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
    alert(`Close account for customer ID: ${this.selectedCustomer.user_id}`);
    this.closeModal();
  }
}