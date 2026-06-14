import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { GlobalService } from '../../services/global-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.email = this.authService.getUserEmail();
  }

  passwordsMatch(): boolean {
    return (
      !!this.newPassword &&
      !!this.confirmPassword &&
      this.newPassword === this.confirmPassword
    );
  }

  isFormValid(form?: NgForm): boolean {
    if (form && form.invalid) {
      return false;
    }
    return (
      !!this.email &&
      !!this.newPassword &&
      !!this.confirmPassword &&
      this.passwordsMatch()
    );
  }

  resetPassword(form?: NgForm): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.email) {
      this.globalService.utilities.notify.error('Email is missing. Please log in again.');
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.globalService.utilities.notify.warning('Please fill all required fields.');
      return;
    }

    if (!this.passwordsMatch()) {
      this.globalService.utilities.notify.warning(
        'New Password and Confirm Password do not match.'
      );
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response?.status) {
          this.globalService.utilities.notify.success(
            response.message || 'Password reset successfully.'
          );
          this.router.navigate(['/dashboard']);
        } else {
          this.globalService.utilities.notify.error(
            response?.message || 'Unable to reset password. Please try again.'
          );
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const message =
          (err && err.message) || 'Unable to reset password. Please try again.';
        this.globalService.utilities.notify.error(message);
      }
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
