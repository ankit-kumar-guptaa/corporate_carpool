import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarpoolSearchComponent } from './components/carpool-search/carpool-search.component';
import { ENVIRONMENTER } from '../environments/environmenter.token';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoadingInterceptor } from './Interceptor/loading.interceptor';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './Shared/shared.module';
import { LoaderComponent } from './Shared/loader/loader.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminEmployeesComponent } from './components/admin/admin-employees/admin-employees.component';
import { AdminReportsComponent } from './components/admin/admin-reports/admin-reports.component';
import { AdminRidesComponent } from './components/admin/admin-rides/admin-rides.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { TransportImpactComponent } from './components/transport-impact/transport-impact.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginSignupComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    TransportImpactComponent,
    CarpoolSearchComponent,
    LoaderComponent,
    AutocompleteComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminEmployeesComponent,
    AdminReportsComponent,
    AdminRidesComponent,
    AdminLayoutComponent,
    ChangePasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule ,
    HttpClientModule,
    SharedModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      preventDuplicates: true
    })
  ],
  providers: [
    { provide: ENVIRONMENTER, useValue: environment },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
