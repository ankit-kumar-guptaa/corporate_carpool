import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../../services/global-service';
import { AuthService } from '../../../core/services/auth.service';

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
    private authService: AuthService
  ) {}

  login() {
    if (!this.username || !this.password) {
      this._globalService.utilities.notify.error('Please enter username/email and password.');
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        const isSuccess = res?.status === true || res?.status === 1;
        const token = res?.data?.token || this.authService.getToken();

        if (isSuccess && token) {
          // AuthService already persisted token/userId/name/email/orgId.
          // Keep legacy adminUser entry so existing admin guard/layout works.
          localStorage.setItem(
            'adminUser',
            JSON.stringify({
              username: res?.data?.email || this.username,
              name: res?.data?.name || '',
              role: 'admin'
            })
          );

          this._globalService.utilities.notify.success(
            res?.message || 'Login Successful'
          );
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this._globalService.utilities.notify.error(
            res?.message || 'Invalid Credentials'
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        const message =
          (err && err.message) ||
          (err && err.raw && err.raw.message) ||
          'Login Failed';
        this._globalService.utilities.notify.error(message);
      }
    });
  }
}
