import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../service/employee.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = {};
  searchTerm: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode: boolean = false;
  employeeIdToDelete: number | null = null;
  
  loggedInEmployeeId: number | null = null;

  constructor(private employeeService: EmployeeService, private toastr:ToastrService) {}  

  ngOnInit(): void {
    this.getLoggedInUserProfile(); 
    this.getEmployees();           
  }
  getLoggedInUserProfile(): void {
  this.employeeService.getLoggedInEmployeeProfile().subscribe({
    next: (employee: any) => { 
      this.loggedInEmployeeId = employee.emp_Id; 
    },
    error: (err) => {
      console.error('Could not fetch logged in employee profile', err);
      this.toastr.error('Could not verify your user session.');
    }
  });
}

  getEmployees() {
    this.employeeService.getEmployees().subscribe(data => {
      this.employees = data;
      this.filteredEmployees = [...data];
    });
  }

  filterEmployees() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term)) ||
      (emp.role && emp.role.toLowerCase().includes(term))
    );
  }

  openAddModal() {
    this.selectedEmployee = {};
    this.isEditMode = false;
    this.imagePreview = null;
    const modal = document.getElementById('employeeModal');
    modal && new bootstrap.Modal(modal).show();
  }

  openEditModal(emp: any) {
    this.selectedEmployee = { 
      id: emp.id || emp.emp_Id,  
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      photoUrl: emp.photoUrl
    };
    this.isEditMode = true;
    this.imagePreview = emp.photoUrl || null;

    const modal = document.getElementById('employeeModal');
    modal && new bootstrap.Modal(modal).show();
  }

  closeModal() {
    const modal = document.getElementById('employeeModal');
    modal && bootstrap.Modal.getInstance(modal)?.hide();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.selectedEmployee.photoUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveEmployee() {
    if (this.isEditMode) {
      this.employeeService.updateEmployee(this.selectedEmployee).subscribe({
        next: () => {
          this.toastr.success('Employee updated successfully!');
          this.getEmployees();   
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error('Error updating employee.');
          console.error('Error updating employee:', err);
        }
      });
    } else {
      this.employeeService.addEmployee(this.selectedEmployee).subscribe({
        next: () => {
          this.toastr.success('Employee added successfully!');
          this.getEmployees();  
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error('Error adding employee.');
          console.error('Error adding employee:', err);
        }
      });
    }
  }

  confirmDelete(id: number) {
    this.employeeIdToDelete = id;
    const modal = document.getElementById('confirmDeleteModal');
    modal && new bootstrap.Modal(modal).show();
  }

  deleteEmployee() {
    if (this.employeeIdToDelete === null) {
      return; 
    }

    this.employeeService.deleteEmployee(this.employeeIdToDelete).subscribe({
      next: () => {
        this.toastr.success('Employee deleted successfully!');
        this.getEmployees(); 
        
        const modal = document.getElementById('confirmDeleteModal');
        modal && bootstrap.Modal.getInstance(modal)?.hide();
        this.employeeIdToDelete = null; 
      },
      error: (err) => {
        // Check for the specific "forbidden" error from the backend
        if (err.status === 403) {
            this.toastr.error('You cannot delete your own account.');
        } else {
            this.toastr.error('Error deleting employee.');
        }
        console.error('Error deleting employee:', err);
        const modal = document.getElementById('confirmDeleteModal');
        modal && bootstrap.Modal.getInstance(modal)?.hide();
      }
    });
  }
}