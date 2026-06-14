import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  loggedInUserName: string = '';

  constructor(private router: Router, private authService: AuthService) {
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
    // JWT token is the source of truth for "is the user logged in".
    const hasToken = this.authService.isLoggedIn();
    const adminUserRaw = localStorage.getItem('adminUser');

    if (!hasToken) {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.loggedInUserName = '';
      return;
    }

    if (adminUserRaw) {
      try {
        const admin = JSON.parse(adminUserRaw);
        if (admin && admin.role === 'admin') {
          this.isLoggedIn = true;
          this.isAdmin = true;
          this.loggedInUserName =
            admin.name || admin.username || this.authService.getUserName() || 'Admin';
          return;
        }
      } catch {
        // fall through to regular-user branch
      }
    }

    this.isLoggedIn = true;
    this.isAdmin = false;
    this.loggedInUserName =
      this.authService.getUserName() ||
      localStorage.getItem('loggedInUserName') ||
      'User';
  }

  onLogin(userName: string): void {
    // Kept for backward compatibility — primary state is driven by checkLoginStatus.
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

    // Clears ALL localStorage + sessionStorage and hard-redirects to '/'.
    this.authService.logout(true, '/');
  }
}
