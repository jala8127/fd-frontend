import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { EmployeesComponent } from './admin/employees/employees.component';
import { CustomersComponent } from './admin/customers/customers.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';

export const routes: Routes = [
     { path: '', component: LoginComponent },
     { path: 'register', component: RegisterComponent },
     { path: 'admin/admin-dashboard', component: AdminDashboardComponent },
     { path: 'user/user-dashboard', component: UserDashboardComponent },
     { path: 'login', component: LoginComponent},

     
     {path: 'admin',
     component: AdminDashboardComponent,
     children: [
          { path: '', redirectTo: 'admin-home', pathMatch: 'full' },
          { path: 'admin-home', component: AdminHomeComponent },
          { path: 'employees', component: EmployeesComponent },
          { path: 'customers', component: CustomersComponent },
     ]
     }   
];


