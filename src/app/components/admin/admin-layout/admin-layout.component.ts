import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  isSidebarToggled = false;

  constructor(private router: Router) {}

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
