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
  _user: UserModel = new UserModel();
  @Output() loginEvent = new EventEmitter<string>();
  showImpactScreen: boolean = false;

  constructor(private router: Router, private _globalService: GlobalService) { }

  ngOnInit(): void {
    const userProfile = this._globalService.utilities.storage.get('UserProfile');
    if (userProfile) {
      this.router.navigate(['/carpool-search']);
    }
  }

  toggleForm(isLogin: boolean): void {
    this.isLoginActive = true; // Force login only
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
      (res: any) => {
        if (res.status === 1 && res.data.dataset.table.length > 0) {
          const userdetails = JSON.parse(res.data.dataset.table1[0].userdetails)[0];
          this.finishLogin(userdetails);
        } else {
          this._globalService.utilities.notify.error('Invalid Login Details.');
        }
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
}
