import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { EmployeesComponent } from './admin/employees/employees.component';
import { CustomersComponent } from './admin/customers/customers.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { UserHomeComponent } from './user/user-home/user-home.component';
import { UserSettingsComponent } from './user/user-settings/user-settings.component';
import { KycComponent } from './user/kyc/kyc.component';
import { PaymentsComponent } from './user/payments/payments.component';
import { SchemesComponent } from './user/schemes/schemes.component';
import { DepositsComponent } from './user/deposits/deposits.component';
import { VerificationComponent } from './admin/verification/verification.component';
import { AboutComponent } from './user/about/about.component';
import { HelpComponent } from './user/help/help.component';
import { AdminSchemesComponent } from './admin/admin-schemes/admin-schemes.component';
import { SupportComponent } from './admin/support/support.component';
import { AdminDepositsComponent } from './admin/admin-deposits/admin-deposits.component';
import { AdminPaymentsComponent } from './admin/admin-payments/admin-payments.component';

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
          { path: 'admin-schemes', component: AdminSchemesComponent },
          { path: 'admin-deposits', component: AdminDepositsComponent },
          { path: 'admin-payments', component: AdminPaymentsComponent },
          { path: 'employees', component: EmployeesComponent },
          { path: 'customers', component: CustomersComponent },
          { path: 'verification', component: VerificationComponent },
          { path: 'support', component: SupportComponent },
     ]
},  
     {path: 'user',
     component: UserDashboardComponent,
     children: [
          { path: '', redirectTo: 'user-home', pathMatch: 'full' },
          { path: 'user-home', component: UserHomeComponent },
          { path: 'schemes', component: SchemesComponent },
          { path: 'deposits', component: DepositsComponent },
          { path: 'payments', component: PaymentsComponent },
          { path: 'kyc', component: KycComponent },
          { path: 'about', component: AboutComponent },
          { path: 'help', component: HelpComponent },
          { path: 'user-settings', component: UserSettingsComponent },
     ]
}
];


