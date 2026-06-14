import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarToggled = false;
  adminName: string = 'Admin';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && (userObj.name || userObj.username)) {
          this.adminName = userObj.name || userObj.username;
        }
      } catch (e) { /* ignore */ }
    } else if (this.authService.getUserName()) {
      this.adminName = this.authService.getUserName();
    }
  }

  toggleSidebar() {
    this.isSidebarToggled = !this.isSidebarToggled;
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.classList.toggle('toggled');
    }
  }

  logout() {
    // Wipes localStorage + sessionStorage and hard-redirects to admin login.
    this.authService.logout(true, '/admin/login');
  }
}
