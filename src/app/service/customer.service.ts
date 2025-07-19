import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  userId?: number;
  name: string;
  email: string;
  phone: string;
  dob?: string;        
  mpin?: string;       
  panNo?: string;     
  status?: string;
  address?: string;
  activeFd?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private userApi = 'http://localhost:8080/api/user';
  private authApi = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.userApi}/all`);
  }

  getCustomerByEmail(email: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.userApi}/${email}`);
  }

  updateCustomer(customer: Customer): Observable<any> {
    return this.http.put(`${this.userApi}/update`, customer);
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.authApi}/register`, customer);
  }
  getLoggedInUserDetails() {
  return this.http.get<any>(`/api/user/profile`);
  }

  updateUserField(field: string, value: any) {
  return this.http.put(`/api/user/update-field`, { field, value });
  }
}