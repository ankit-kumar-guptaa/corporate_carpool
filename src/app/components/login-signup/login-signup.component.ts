import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global-service';
import { helper } from '../../models/helper';
import { UserModel } from '../../models/user-login.model';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent {
  isLoginActive: boolean = true;
  isOtpButtonVisible: boolean = false;
  isOtpSectionVisible: boolean = false;
  isPasswordSectionVisible: boolean = false;
  otpValue: string = '';
  _user: UserModel = new UserModel();
  @Output() loginEvent = new EventEmitter<string>();

  constructor(private router: Router, private _globalService: GlobalService) { }

  toggleForm(isLogin: boolean): void {
    this.isLoginActive = isLogin;
  }

  onEmailInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const email = inputElement.value.trim();
    const officialEmailPattern = /^[a-zA-Z0-9._%+-]+@elitecorporate\.com$/;

    this.isOtpButtonVisible = officialEmailPattern.test(email);
  }

  sendOtp(): void {
    this.isOtpSectionVisible = true;
  }

  onOtpInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.otpValue = inputElement.value.trim();

    if (this.otpValue === '123456') {
      this.isPasswordSectionVisible = true;
    }
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

    // debugger;
    helperdata.spName = "CORP_Login";
    helperdata.payload = JSON.stringify(param);
    this._globalService.ServiceManager.request.post('Ride/GetDataFromServer', helperdata).subscribe(res => {
      console.log(res);
      debugger;
      if (res.status == 1) {

        if (res.data.dataset.table.length > 0) {

          var userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
          this.loginEvent.emit(userdetails.name); 
          this._globalService.utilities.storage.set('UserDetails', JSON.stringify(userdetails) );


          this.router.navigate(['/carpool-search']);
          // this.connections = res.data.dataset.table;
          // this.MySendRequests = res.data.dataset.table1;

          // let jsonObj = JSON.parse(res.data.dataset.table1[0].condidate)[0];
        }
        else {
          this._globalService.utilities.notify.error('Invalid credentials.');
        }
      }
    });



    // if (email === 'ankit@elitecorporate.com' && password === 'password123') {
    //   this.loginEvent.emit('Ankit'); 
    //   console.log("Log in successful");

    //   // Navigate to carpool search after successful login
    //   this.router.navigate(['/carpool-search']);
    // } else {
    //   this._globalService.utilities.notify.error('Invalid credentials. Please try again.');

    // }
  }

  signup(): void {
    if (this.otpValue === '123456') {
      alert('Signup successful! You can now login with your credentials.');
      this.toggleForm(true);
    }
  }

  forgotPassword(): void {
   
    this._globalService.utilities.notify.info('Forgot Password feature is not yet implemented.');
  }
}
