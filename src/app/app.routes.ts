import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';

export const routes: Routes = [


     { path: '', component: LoginComponent },
     { path: 'register', component: RegisterComponent },
     { path: 'admin/admin-dashboard', component: AdminDashboardComponent },
     { path: 'user/user-dashboard', component: UserDashboardComponent },
     { path: 'login', component: LoginComponent}

      
];


