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
  bankName?: string;
  bankAccNo?: string;
  bankIfsc?: string;
  [key: string]: any;
}

export interface Scheme {
  id: number;
  schemeName: string;

}

export interface FdAccount {
  id: number;
  scheme: Scheme; 
  amount: number; 
  interestEarned: number;
  startDate: string; 
  maturityDate: string;
  closeDate?: string;
  status: 'ACTIVE' | 'CLOSED';
  maturityAmount?: number; 
}


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private userApi = 'http://localhost:8080/api/user';
  private authApi = 'http://localhost:8080/api/auth';


  constructor(private http: HttpClient) {}

  getLoggedInUserDetails(): Observable<Customer> {
    return this.http.get<Customer>(`${this.userApi}/profile`);
  }

  updateUserField(field: string, value: any): Observable<any> {
    return this.http.put(`${this.userApi}/update-field`, { field, value });
  }

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
  getFdsByUserId(userId: number): Observable<FdAccount[]> {
    return this.http.get<FdAccount[]>(`${this.userApi}/user/${userId}/fds`);
  }
}
