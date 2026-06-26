import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global-service';
import { UserModel } from '../../models/user-login.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent implements OnInit {
  isLoginActive: boolean = true;
  _user: UserModel = new UserModel();
  @Output() loginEvent = new EventEmitter<string>();
  showImpactScreen: boolean = false;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private _globalService: GlobalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleForm(_isLogin: boolean): void {
    this.isLoginActive = true;
  }

  login(): void {
    if (!this._user.email || !this._user.Password) {
      this._globalService.utilities.notify.error('Please Enter Email and Password.');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this._user.email, this._user.Password).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (!response || response.status !== true || !response.data?.token) {
          this._globalService.utilities.notify.error(
            response?.message || 'Invalid Login Details.'
          );
          return;
        }

        this.loginEvent.emit(response.data.name);
        this._globalService.utilities.notify.success(
          response.message || 'Login successful.'
        );

        if (response.data.isResetPassword === false) {
          this.router.navigate(['/reset-password']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const message = (err && err.message) || 'Invalid Login Details.';
        this._globalService.utilities.notify.error(message);
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(): void {
    this._globalService.utilities.notify.info(
      'Forgot Password feature is not yet implemented.'
    );
  }
}
