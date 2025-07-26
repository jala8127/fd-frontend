import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChartData {
  month: string;
  totalPayments: number;
  totalPayouts: number;
}

export interface Employee {
  id?: number;
  name: string;
  email: string;    
  phone: string;
  department: string;
  role: string;
  photoUrl?: string;
}
export interface SupportTicketPayload {
  customerEmail: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees'; 
  private supportApiUrl = 'http://localhost:8080/api/support';

  constructor(private http: HttpClient) {}


  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${employee.id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  loginEmployee(email: string, password: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/auth/employees/login', { email, password });
  }

 getTotalDeposits(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/admin/total-deposits`);
  }

  getMonthlyPayouts(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/admin/monthly-payouts`);
  }

  getMonthlyReceived(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/admin/monthly-received`);
  }

  getRecentTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/recent-transactions`);
  }


  addCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-customer`, customerData);
  }

  makeManualDeposit(depositData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/manual-deposit`, depositData);
  }

  closeDeposit(depositData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/close-deposit`, depositData);
  }

  verifyKyc(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-kyc`, formData);
  }
  getLoggedInEmployeeProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/profile`);
  }
  raiseTicket(ticketData: SupportTicketPayload): Observable<any> {
    return this.http.post(`${this.supportApiUrl}/create`, ticketData);
  }
   getMonthlyChartData(): Observable<ChartData[]> {
    return this.http.get<ChartData[]>(`${this.apiUrl}/admin/chart-data`);
  }
}
