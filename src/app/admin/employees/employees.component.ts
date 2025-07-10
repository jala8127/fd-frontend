import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../service/employee.service';

declare var bootstrap: any;

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  constructor(private employeeService: EmployeeService) {}  
  employees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = {};
  searchTerm: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.getEmployees();
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
      emp.department.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term)
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
        this.getEmployees();   
        this.closeModal();
      },
      error: (err) => {
        console.error('Error updating employee:', err);
      }
    });
  } else {
    this.employeeService.addEmployee(this.selectedEmployee).subscribe({
      next: () => {
        this.getEmployees();  
        this.closeModal();
      },
      error: (err) => {
        console.error('Error adding employee:', err);
      }
    });
  }
}

  confirmDelete(id: number) {
    const modal = document.getElementById('confirmDeleteModal');
    modal && new bootstrap.Modal(modal).show();
    (window as any).deleteEmpId = id;
  }

  deleteEmployee() {
    const id = (window as any).deleteEmpId;
    this.employees = this.employees.filter(e => e.id !== id);
    this.filterEmployees();
    const modal = document.getElementById('confirmDeleteModal');
    modal && bootstrap.Modal.getInstance(modal)?.hide();
  }
}
