import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarpoolSearchComponent } from './components/carpool-search/carpool-search.component';
import { AuthGuard } from './guards/auth.guard';
// import { LoginSignupComponent } from './components/login-signup/login-signup.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'carpool-search', component: CarpoolSearchComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }, // Fallback to login if no match
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
