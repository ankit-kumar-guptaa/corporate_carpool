import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global-service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  isLoading = false;

  constructor(private router: Router, private _globalService: GlobalService) {}

  login() {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.username === 'admin' && this.password === 'admin123') {
        localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin' }));
        this._globalService.utilities.notify.success('Login Successful');
        this.router.navigate(['/admin/dashboard']);
      } else {
        this._globalService.utilities.notify.error('Invalid Credentials');
      }
      this.isLoading = false;
    }, 1000);
  }
}
