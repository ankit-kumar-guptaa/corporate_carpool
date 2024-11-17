import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = true;
  loggedInUserName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('loggedInUserName');

    if (loggedIn === 'true' && userName) {
      this.isLoggedIn = true;
      this.loggedInUserName = userName;
      
      // this.router.navigate(['/carpool-search']);
    }
  }

  onLogin(userName: string): void {
    this.isLoggedIn = true;
    this.loggedInUserName = userName;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUserName', userName);

    
    // this.router.navigate(['/carpool-search']);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loggedInUserName = '';

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');

    // Redirect to the home page after logout
    this.router.navigate(['/']);
  }
}
