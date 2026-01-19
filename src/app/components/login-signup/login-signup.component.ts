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

  // Impact Analysis Properties
  showImpactScreen: boolean = false;
  transportMode: string = '';
  vehicleType: string = '';
  fuelType: string = '';
  bikeFuelType: string = '';
  impactCalculated: boolean = false;
  
  // Constants for Office Location (Example: Connaught Place, New Delhi)
  readonly OFFICE_LAT: number = 28.6304; 
  readonly OFFICE_LNG: number = 77.2177; 

  // Calculation Results
  distanceKm: number = 0;
  currentEmission: number = 0;
  co2Saved: number = 0;

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
    
    // Reset Impact Analysis
    this.showImpactScreen = false;
    this.transportMode = '';
    this.vehicleType = '';
    this.fuelType = '';
    this.bikeFuelType = '';
    this.impactCalculated = false;
    this.distanceKm = 0;
    this.currentEmission = 0;
    this.co2Saved = 0;
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
    if (this.isEmailVerified && this.isPhoneVerified && this._user.name && this._user.Password && this._user.Address) {
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

  handleAddress(place: any) {
    this._user.Address = place.formatted_address;
    this._user.Latitude = place.geometry.location.lat().toString();
    this._user.Longitude = place.geometry.location.lng().toString();
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

          // Set localStorage for AppComponent to pick up
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loggedInUserName', userdetails.name);

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

    // Instead of calling API directly, show Impact Screen
    // We assume the user has entered a valid address in handleAddress
    if (!this._user.Address || !this._user.Latitude) {
       this._globalService.utilities.notify.error('Please select your Home Location.');
       return;
    }

    this.showImpactScreen = true;
    this.calculateImpact(); // Initial calculation if possible, or wait for user input
  }

  selectTransport(mode: string): void {
    this.transportMode = mode;
    this.vehicleType = '';
    this.fuelType = '';
    this.bikeFuelType = '';
    this.impactCalculated = false;
    if (mode === 'Cab') {
      this.calculateImpact();
    }
  }

  selectVehicle(type: string): void {
    this.vehicleType = type;
    this.fuelType = '';
    this.bikeFuelType = '';
    this.impactCalculated = false;
  }

  selectFuel(type: string): void {
    if (this.vehicleType === 'Car') {
      this.fuelType = type;
    } else {
      this.bikeFuelType = type;
    }
    this.calculateImpact();
  }

  calculateImpact(): void {
    // 1. Calculate Distance (Haversine Formula)
    const lat1 = parseFloat(this._user.Latitude);
    const lon1 = parseFloat(this._user.Longitude);
    const lat2 = this.OFFICE_LAT;
    const lon2 = this.OFFICE_LNG;

    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    this.distanceKm = R * c; // One way distance

    // 2. Calculate Emissions
    // Emission Factors (kg CO2 per km) - Approximate
    let emissionFactor = 0;

    if (this.transportMode === 'Cab') {
      emissionFactor = 0.192; // Avg Car
    } else if (this.transportMode === 'Self') {
      if (this.vehicleType === 'Car') {
        if (this.fuelType === 'Petrol') emissionFactor = 0.192;
        else if (this.fuelType === 'CNG') emissionFactor = 0.150; // Lower than petrol
        else if (this.fuelType === 'Electric') emissionFactor = 0.050; // Grid intensity dependent, but lower
      } else if (this.vehicleType === 'Bike') {
        if (this.bikeFuelType === 'Petrol') emissionFactor = 0.100;
        else if (this.bikeFuelType === 'Electric') emissionFactor = 0.020;
      }
    }

    const roundTripDistance = this.distanceKm * 2;
    this.currentEmission = roundTripDistance * emissionFactor;

    // Potential Saving: If they carpool (share with 3 others = 1/4th emission) or use shuttle
    // We assume they save ~75% if switching from Car to Carpool, or 100% if switching to EV shuttle (ideal scenario)
    // Let's simply say: Saving = Current Emission * 0.8 (Assumption for impact visualization)
    // Or if they are already EV, saving is less but congestion is reduced.
    // User asked: "CO2 emission per day ke hisaab se employee kitna kam krenge" (How much they will reduce)
    
    // Logic: 
    // If Solo Car (Petrol) -> Carpool (4 pax) => Saving is 75%
    // If Bike -> Carpool => Might actually increase CO2 if car is used, but safer/comfortable. 
    // Let's assume the comparison is against "Solo Driving".
    
    // We display "Potential CO2 Reduction per Day"
    this.co2Saved = this.currentEmission * 0.75; // Generic 75% reduction assumption for carpooling
    
    this.impactCalculated = true;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  completeRegistration(): void {
    const param: any = {
      email: this._user.email,
      mobile_No: this._user.mobile_No,
      Password: this._user.Password,
      name: this._user.name,
      domain: this.domain,
      VehicleType: this._user.VehicleType || 'None', // Default if empty
      // We could also send transport profile data if backend supported it
      Address: this._user.Address,
      Latitude: this._user.Latitude,
      Longitude: this._user.Longitude
    };
    const helperdata = new helper();
    helperdata.spName = 'CORP_User_Register';
    helperdata.payload = JSON.stringify(param);
    
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(
      (res) => {
        // BYPASS RESTRICTION: Even if status is not 1 (e.g. user exists), we proceed for demo
        // Normal check: if (res.status === 1 && res.data.dataset.table.length > 0)
        
        // Simulating success even if it fails (User request: "comment out restriction")
        // We try to get user details if returned, otherwise mock it or try login
        
        if (res.status === 1 && res.data.dataset.table.length > 0) {
             const userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
             this.finishLogin(userdetails);
        } else {
             // Restriction Bypass Logic:
             // If user already exists, the API might not return user details. 
             // We can try to call Login automatically or just mock success.
             // Let's try to Login with the same credentials to get the user object.
             this.login();
        }
      },
      (err) => {
         // On error, also try login or mock
         this.login();
      }
    );
  }

  finishLogin(userdetails: any): void {
      this.loginEvent.emit(userdetails.name);
      this._globalService.utilities.storage.set('UserProfile', JSON.stringify(userdetails));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUserName', userdetails.name);
      this.router.navigate(['/carpool-search']);
  }


  forgotPassword(): void {
    this._globalService.utilities.notify.info('Forgot Password feature is not yet implemented.');
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.currentOtp = '';
  }
}
