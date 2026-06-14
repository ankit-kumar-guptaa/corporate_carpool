import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global-service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  email: string = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;

  constructor(
    private location: Location,
    private router: Router,
    private globalService: GlobalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.email = this.authService.getUserEmail();
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.globalService.utilities.notify.warning('Please fill all required fields.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.globalService.utilities.notify.warning('New Password and Confirm Password do not match.');
      return;
    }

    if (!this.email) {
      this.globalService.utilities.notify.error('Session expired. Please log in again.');
      this.router.navigate(['/']);
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .changePassword(this.email, this.currentPassword, this.newPassword)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response?.status) {
            this.globalService.utilities.notify.success(
              response.message || 'Password updated successfully.'
            );
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.goBack();
          } else {
            this.globalService.utilities.notify.error(
              response?.message || 'Unable to change password. Please try again.'
            );
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          const message =
            (err && err.message) || 'Unable to change password. Please try again.';
          this.globalService.utilities.notify.error(message);
        }
      });
  }

  goBack() {
    this.location.back();
  }
}
