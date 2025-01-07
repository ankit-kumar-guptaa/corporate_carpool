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
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './Shared/shared.module';
import { LoaderComponent } from './Shared/loader/loader.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginSignupComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    CarpoolSearchComponent,
    LoaderComponent,
    AutocompleteComponent
    
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
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
