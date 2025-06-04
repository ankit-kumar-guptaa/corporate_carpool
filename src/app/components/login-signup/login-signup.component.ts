import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { helper } from '../../models/helper';
import { UserModel } from '../../models/user-login.model';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent implements OnInit {
  isLoginActive: boolean = true;
  isEmailSent: boolean = false;
  isEmailVerified: boolean = false;
  isPhoneSent: boolean = false;
  isPhoneVerified: boolean = false;
  progress: number = 0;
  resendTimer: number = 0;
  currentOtp: string = '';
  domain: string = 'elitecorporatesolutions';
  serverOTP: string = '';
  serverPhoneOTP: string = '';
  _user: UserModel = new UserModel();
  @Output() loginEvent = new EventEmitter<string>();
  showOtpModal: boolean = false;
  isEmailOtpMode: boolean = true;

  constructor(private router: Router, private _globalService: GlobalService) { }

  ngOnInit(): void {
    const userProfile = this._globalService.utilities.storage.get('UserProfile');
    if (userProfile) {
      this.router.navigate(['/carpool-search']);
    }
  }

  toggleForm(isLogin: boolean): void {
    this.isLoginActive = isLogin;
    this.resetForm();
  }

  resetForm(): void {
    this._user = new UserModel();
    this.isEmailSent = false;
    this.isEmailVerified = false;
    this.isPhoneSent = false;
    this.isPhoneVerified = false;
    this.progress = 0;
    this.currentOtp = '';
    this.serverOTP = '';
    this.serverPhoneOTP = '';
    this.resendTimer = 0;
    this.showOtpModal = false;
  }

  onEmailInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const email = inputElement.value.trim();
    console.log('Email Input:', email);
    this._user.email = email;
    const officialEmailPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@(${this.domain}|gmail\\.com)$`);
    this.isEmailSent = officialEmailPattern.test(email) && email !== '';
    this.updateProgress();
  }

  onPhoneInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this._user.mobile_No = inputElement.value.trim();
    console.log('Phone Input:', this._user.mobile_No);
    this.updateProgress();
  }

  onOtpInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.currentOtp = inputElement.value.trim();
    console.log('OTP Input:', this.currentOtp);
  }

  updateProgress(): void {
    if (this.isEmailVerified && this.isPhoneVerified && this._user.name && this._user.Password) {
      this.progress = 100;
    } else if (this.isEmailVerified && this._user.mobile_No) {
      this.progress = 75;
    } else if (this.isEmailVerified) {
      this.progress = 50;
    } else if (this.isEmailSent) {
      this.progress = 25;
    } else {
      this.progress = 0;
    }
  }

  sendOtp(): void {
    console.log('Sending OTP, Email:', this._user.email);
    if (!this._user.email || this._user.email.trim() === '') {
      this._globalService.utilities.notify.error('Please Enter Email.');
      return;
    }
    const officialEmailPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@(${this.domain}|gmail\\.com)$`);
    if (!officialEmailPattern.test(this._user.email)) {
      this._globalService.utilities.notify.error('Please Enter a Valid Email.');
      return;
    }
    this.serverOTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.currentOtp = '';
    this.sendOtpByEmail(this._user.email, this.serverOTP);
  }

  sendOtpByEmail(email: string, OTP: string) {
    const param: any = {
      To: email,
      Subject: 'GreenCar - OTP for Registration',
      Body: `Dear Employee,<br/><br/>Your OTP is: <b>${OTP}</b><br/><br/>Please don't share your OTP with anyone. OTP is valid for 10 minutes<br/><br/>Regards,<br/><b>GreenCar</b>`
    };
    console.log('Email Request Payload:', param);
    this._globalService.ServiceManager.request.postWithoutEncryptionEmail('Ride/sendemail', param).subscribe(
      (response) => {
        console.log('Email Send Response:', response);
        this.startResendTimer();
        this._globalService.utilities.notify.success('OTP sent to your email.');
        this.isEmailOtpMode = true;
        this.showOtpModal = true; // Open modal only on success
      },
      (err) => {
        console.error('Email Send Error:', err);
        this._globalService.utilities.notify.error('Failed to send OTP email. Please try again.');
      }
    );
  }

  sendPhoneOtp(): void {
    console.log('Sending Phone OTP, Phone:', this._user.mobile_No);
    if (!this._user.mobile_No || this._user.mobile_No.trim() === '' || this._user.mobile_No.length !== 10) {
      this._globalService.utilities.notify.error('Please Enter a valid 10-digit Phone Number.');
      return;
    }
    this._globalService.ServiceManager.request.get(`Ride/SendOTP?MobileNo=${this._user.mobile_No}`).subscribe(
      (resp) => {
        console.log('Phone OTP Response:', resp);
        if (resp.status === 'ok') {
          this.serverPhoneOTP = resp.requestid.slice(8, 14);
          this.currentOtp = '';
          this.startResendTimer();
          this._globalService.utilities.notify.success('OTP sent to your mobile number.');
          this.isEmailOtpMode = false;
          this.showOtpModal = true; // Open modal only on success
        } else {
          this._globalService.utilities.notify.error('Failed to send OTP. Please try again later.');
        }
      },
      (err) => {
        console.error('Phone OTP Error:', err);
        this._globalService.utilities.notify.error('Something went wrong. Try again.');
      }
    );
  }

  verifyOtp(): void {
    const serverOtp = this.isEmailOtpMode ? this.serverOTP : this.serverPhoneOTP;
    if (!this.currentOtp || this.currentOtp.trim() === '') {
      this._globalService.utilities.notify.error('Please Enter OTP.');
      return;
    }
    if (this.currentOtp === serverOtp) {
      if (this.isEmailOtpMode) {
        this.isEmailVerified = true;
        this._globalService.utilities.notify.success('Email verified successfully.');
      } else {
        this.isPhoneVerified = true;
        this._globalService.utilities.notify.success('Phone verified successfully.');
      }
      this.showOtpModal = false;
      this.updateProgress();
    } else {
      this._globalService.utilities.notify.error('Invalid OTP. Please try again.');
    }
    this.currentOtp = '';
  }

  resendOtp(): void {
    if (this.resendTimer <= 0) {
      if (this.isEmailOtpMode) {
        this.sendOtp();
      } else {
        this.sendPhoneOtp();
      }
    }
  }

  startResendTimer(): void {
    this.resendTimer = 30;
    const interval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  editPhone(): void {
    this._user.mobile_No = '';
    this.isPhoneSent = false;
    this.isPhoneVerified = false;
    this.updateProgress();
  }

  login(): void {
    if (!this._user.email || !this._user.Password) {
      this._globalService.utilities.notify.error('Please Enter Email and Password.');
      return;
    }
    const param: any = { email: this._user.email, Password: this._user.Password };
    const helperdata = new helper();
    helperdata.spName = 'CORP_Login';
    helperdata.payload = JSON.stringify(param);
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(
      (res) => {
        if (res.status === 1 && res.data.dataset.table.length > 0) {
          const userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
          this.loginEvent.emit(userdetails.name);
          this._globalService.utilities.storage.set('UserProfile', JSON.stringify(userdetails));
          this.router.navigate(['/carpool-search']);
        } else {
          this._globalService.utilities.notify.error('Invalid Login Details.');
        }
      }
    );
  }

  signup(): void {
    if (!this._user.email || !this._user.mobile_No || !this._user.Password || !this._user.name) {
      this._globalService.utilities.notify.error('Please fill all required fields.');
      return;
    }
    const param: any = {
      email: this._user.email,
      mobile_No: this._user.mobile_No,
      Password: this._user.Password,
      name: this._user.name,
      domain: this.domain
    };
    const helperdata = new helper();
    helperdata.spName = 'CORP_User_Register';
    helperdata.payload = JSON.stringify(param);
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(
      (res) => {
        if (res.status === 1 && res.data.dataset.table.length > 0) {
          const userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
          this.loginEvent.emit(userdetails.name);
          this._globalService.utilities.storage.set('UserProfile', JSON.stringify(userdetails));
          this.router.navigate(['/carpool-search']);
        } else {
          this._globalService.utilities.notify.error('Email or Phone already exists.');
        }
      }
    );
  }

  forgotPassword(): void {
    this._globalService.utilities.notify.info('Forgot Password feature is not yet implemented.');
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.currentOtp = '';
  }
}
