import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (this.authService.isLoggedIn() && this.hasAdminRole()) {
      return true;
    }

    return this.router.createUrlTree(['/admin/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  private hasAdminRole(): boolean {
    const raw = localStorage.getItem('adminUser');
    if (!raw) {
      return false;
    }
    try {
      const user = JSON.parse(raw);
      return !!user && user.role === 'admin';
    } catch {
      return false;
    }
  }
}
