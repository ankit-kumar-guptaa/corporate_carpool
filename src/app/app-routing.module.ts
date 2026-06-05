import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarpoolSearchComponent } from './components/carpool-search/carpool-search.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminEmployeesComponent } from './components/admin/admin-employees/admin-employees.component';
import { AdminReportsComponent } from './components/admin/admin-reports/admin-reports.component';
import { AdminRidesComponent } from './components/admin/admin-rides/admin-rides.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { TransportImpactComponent } from './components/transport-impact/transport-impact.component';
const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'carpool-search', component: CarpoolSearchComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'transport-impact', component: TransportImpactComponent, canActivate: [AuthGuard] },
  
  // Admin Routes
  { path: 'admin/login', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [AdminAuthGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'employees', component: AdminEmployeesComponent },
      { path: 'rides', component: AdminRidesComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }, // Fallback to login if no match
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
