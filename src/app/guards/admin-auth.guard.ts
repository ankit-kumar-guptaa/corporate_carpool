import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        const user = JSON.parse(adminUser);
        if (user.username === 'admin' && user.role === 'admin') {
            return true;
        }
    }
    this.router.navigate(['/admin/login']);
    return false;
  }
}
