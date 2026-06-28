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
    if (this.authService.isLoggedIn() && this.hasAdminRole() && this.isValidSession()) {
      return true;
    }

    // Clear stale/expired token so admin login page starts clean
    if (this.authService.getToken()) {
      this.authService.logout(false);
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

  // Bug 2 Fix: Validate that this tab's session matches the latest admin login
  private isValidSession(): boolean {
    const globalSessionId = localStorage.getItem('adminSessionId');
    const tabSessionId = sessionStorage.getItem('adminSessionId');

    // If no session IDs exist (legacy), allow access
    if (!globalSessionId) {
      return true;
    }

    // If this tab doesn't have a session ID, it's a stale tab
    if (!tabSessionId) {
      return false;
    }

    // If session IDs don't match, another tab logged in — invalidate this one
    return globalSessionId === tabSessionId;
  }
}

