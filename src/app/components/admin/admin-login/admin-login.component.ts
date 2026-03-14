import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../services/global-service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  isLoading = false;

  constructor(
      private router: Router, 
      private _globalService: GlobalService,
      private adminService: AdminService
  ) {}

  login() {
    this.isLoading = true;
    
    const loginData = {
        MobileNo: this.username,
        Password: this.password
    };

    this.adminService.adminLogin(loginData).subscribe({
      next: (res: any) => {
        if (res && res.status === 1 && res.data) {
          localStorage.setItem('adminUser', JSON.stringify({ username: res.data.username, role: res.data.role }));
          this._globalService.utilities.notify.success('Login Successful');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this._globalService.utilities.notify.error(res.message || 'Invalid Credentials');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login Error', err);
        this._globalService.utilities.notify.error('Login Failed');
        this.isLoading = false;
      }
    });
  }
}
