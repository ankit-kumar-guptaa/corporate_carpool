import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarToggled = false;
  adminName: string = 'Admin';

  constructor(private router: Router) {}

  ngOnInit() {
      const userStr = localStorage.getItem('adminUser');
      if (userStr) {
          try {
              const userObj = JSON.parse(userStr);
              if (userObj && userObj.username) {
                  this.adminName = userObj.username;
              }
          } catch(e) {}
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
    localStorage.removeItem('adminUser');
    this.router.navigate(['/admin/login']);
  }
}
