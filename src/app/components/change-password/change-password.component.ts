import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { GlobalService } from '../../services/global-service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;

  constructor(
    private location: Location,
    private globalService: GlobalService
  ) {}

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.globalService.utilities.notify.warning('New Password and Confirm Password do not match.');
      return;
    }
    
    this.isSubmitting = true;
    
    // Simulating API call for password reset since backend might not have this specific endpoint yet
    setTimeout(() => {
      this.isSubmitting = false;
      this.globalService.utilities.notify.success('Password reset successfully!');
      this.goBack();
    }, 1500);
  }

  goBack() {
    this.location.back();
  }
}
