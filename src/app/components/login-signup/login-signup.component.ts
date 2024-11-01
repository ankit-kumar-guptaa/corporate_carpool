import { Component, EventEmitter, Output } from '@angular/core';

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
  
  @Output() loginEvent = new EventEmitter<string>();

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
    // Dummy credentials
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    if (email === 'ankit@elitecorporate.com' && password === 'password123') {
      this.loginEvent.emit('Ankit'); 
    } else {
      alert('Invalid credentials. Please try again.');
    }
  }

  signup(): void {
    if (this.otpValue === '123456') {
      alert('Signup successful! You can now login with your credentials.');
      this.toggleForm(true); // Switch to login after successful signup
    }
  }
}
