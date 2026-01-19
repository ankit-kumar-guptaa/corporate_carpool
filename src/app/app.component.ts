import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  loggedInUserName: string = '';

  constructor(private router: Router) {
    // Subscribe to router events to update auth state on navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLoginStatus();
      }
    });
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('loggedInUserName');
    const adminUser = localStorage.getItem('adminUser');

    if (adminUser) {
      const admin = JSON.parse(adminUser);
      this.isLoggedIn = true;
      this.isAdmin = true;
      this.loggedInUserName = admin.username || 'Admin';
    } else if (loggedIn === 'true' && userName) {
      this.isLoggedIn = true;
      this.isAdmin = false;
      this.loggedInUserName = userName;
    } else {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.loggedInUserName = '';
    }
  }

  onLogin(userName: string): void {
    // This might still be called if referenced elsewhere, but primary logic is now in checkLoginStatus
    this.isLoggedIn = true;
    this.isAdmin = false;
    this.loggedInUserName = userName;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUserName', userName);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.loggedInUserName = '';

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserName');
    localStorage.removeItem('adminUser');

    // Redirect to the home page after logout
    this.router.navigate(['/']);
  }
}
