import { Component, EventEmitter, Output, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { helper } from '../../models/helper';
import { UserModel } from '../../models/user-login.model';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent implements AfterViewInit {
  isLoginActive: boolean = true;
  isOtpButtonVisible: boolean = false;
  isOtpSectionVisible: boolean = false;
  isPasswordSectionVisible: boolean = false;
  otpValue: string = '';
  domain: string = 'businessnext'
  serverOTP: string = '';
  _user: UserModel = new UserModel();
  @Output() loginEvent = new EventEmitter<string>();

  constructor(private router: Router, private _globalService: GlobalService) { }

  // ngOnInit(): void {

  // }

  ngAfterViewInit(): void {
    // Add scroll event listener to detect visibility
    window.addEventListener('scroll', this.onScroll);
  }

  // This function checks if an element is in the viewport
  isElementInView(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }

  // Handle scroll event and add 'visible' class to elements in view
  onScroll = (): void => {
    const elements = document.querySelectorAll(
      '.fade-in, .slide-left, .slide-right, .zoom-in, .rotate, .flip-up, .fade-in-scale, .bounce-in'
    );

    elements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      if (this.isElementInView(htmlElement)) {
        htmlElement.classList.add('visible');
      }
    });
  };

  toggleForm(isLogin: boolean): void {
    this.isLoginActive = isLogin;
  }

  onEmailInput(event: Event): void {

    const inputElement = event.target as HTMLInputElement;
    const email = inputElement.value.trim();
    const officialEmailPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@${this.domain}|gmail\.com$`);

    this.isOtpButtonVisible = officialEmailPattern.test(email);
  }

  sendOtp(): void {
    // this.isOtpSectionVisible = true;
    // this._globalService.utilities.notify.success("Otp Sent Successfully");

    //this.otpValue = '123456';

if(this._user.email == '' || this._user.email == undefined){  
  this._globalService.utilities.notify.error('Please Enter Email.');
  return;
}



    this.serverOTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.sendOtpByEmail(this._user.email, this.serverOTP);

  }

  sendOtpByEmail(email: string, OTP: string) {
    debugger;
    var param: any = {};

    param.To = email;
 

    param.Subject = "GreenCar - OTP for Registration";

    param.Body = btoa(`Dear Employee,<br/>
  <br/>
  
  <br/>
  Your OTP is :<b>${OTP}</b>
 
  <br/>
  <br/>
  Please don't share your OTP with anyone. OTP is valid for 10 minutes<br/>
  <br/>
  <br/>
  <br/>
  <br/>
  Regards,
  <br/>
  <b>GreenCar</b>
  <br/>
  <p>Note: This is a system generated email, please do not reply to this message.</p>`)
    //);
    this._globalService.ServiceManager.request.postWithoutEncryptionEmail('Ride/sendemail', param).subscribe(x => {
      this.isOtpSectionVisible = true;

      this._globalService.utilities.notify.success("Otp sent on your email.");

    }
      , err => {
        this._globalService.utilities.notify.error('Something went wrong. Try again.', '');

      }
    )
  }
  verifyOTP() {
    if (this._user.Otp == '' || this._user.Otp == undefined) {
      this._globalService.utilities.notify.error('Please Enter OTP.');
      return;
    }

    if (this._user.Otp == this.serverOTP) {
      this.isPasswordSectionVisible = true;
    }
    else {
      this._globalService.utilities.notify.error('Invalid OTP.');
    }
  }

  onOtpInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.otpValue = inputElement.value.trim();


  }



  login(): void {
    if (this._user.email == '') {
      this._globalService.utilities.notify.error('Please Enter Email.');
      return;
    }
    if (this._user.Password == '') {
      this._globalService.utilities.notify.error('Please Enter Password.');
      return;
    }

    var param: any = {};
    let helperdata = new helper();

    param.email = this._user.email;
    param.Password = this._user.Password;

    helperdata.spName = "CORP_Login";
    helperdata.payload = JSON.stringify(param);
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
      console.log(res);
      if (res.status == 1) {
        if (res.data.dataset.table.length > 0) {
          var userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
          this.loginEvent.emit(userdetails.name);
          this._globalService.utilities.storage.set('UserProfile', JSON.stringify(userdetails));
          this.router.navigate(['/carpool-search']);
        } else {
          this._globalService.utilities.notify.error('Invalid Login Details.');
        }
      }
    });
  }

  signup(): void {

    if (this._user.email == '' || this._user.email == undefined) {
      this._globalService.utilities.notify.error('Please Enter Email.');
      return;
    }
    if (this._user.Password == '' || this._user.Password == undefined) {
      this._globalService.utilities.notify.error('Please Enter Password.');
      return;
    }

    if (this._user.name == '' || this._user.name == undefined) {
      this._globalService.utilities.notify.error('Please Enter Name.');
      return;
    }
    var param: any = {};
    let helperdata = new helper();

    param.email = this._user.email;
    param.Password = this._user.Password;
    param.name = this._user.name;
    param.domain = this.domain;

    helperdata.spName = "CORP_User_Register";
    helperdata.payload = JSON.stringify(param);
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
     debugger;
      if (res.status == 1 && res.data.dataset.table.length > 0) {

        var userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
        this.loginEvent.emit(userdetails.name);
        this._globalService.utilities.storage.set('UserProfile', JSON.stringify(userdetails));
        this.router.navigate(['/carpool-search']);


      } else {
        this._globalService.utilities.notify.error('Email already exists.');
      }
    }
    );



    // if (this.otpValue === '123456') {
    //   alert('Signup successful! You can now login with your credentials.');
    //   this.toggleForm(true);
    // }
  }

  forgotPassword(): void {
    this._globalService.utilities.notify.info('Forgot Password feature is not yet implemented.');
  }
}
