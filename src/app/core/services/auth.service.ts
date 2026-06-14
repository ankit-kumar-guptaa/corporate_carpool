import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  AUTH_STORAGE_KEYS,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateUserRequest,
  CreateUserResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBase: string =
    (environment as any).base || 'http://localhost:5000/api/Corporate';

  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json-patch+json',
    'Accept': '*/*'
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };
    const url = `${this.apiBase}/Corporate/CORP_AdminLogin`;

    return this.http
      .post<LoginResponse>(url, payload, { headers: this.defaultHeaders })
      .pipe(
        tap((response) => {
          if (response?.status && response.data?.token) {
            this.persistSession(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(email: string, newPassword: string): Observable<ResetPasswordResponse> {
    const payload: ResetPasswordRequest = { email, newPassword };
    const url = `${this.apiBase}/Corporate/ResetPassword`;

    return this.http
      .post<ResetPasswordResponse>(url, payload, { headers: this.defaultHeaders })
      .pipe(catchError(this.handleError));
  }

  changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Observable<ChangePasswordResponse> {
    const payload: ChangePasswordRequest = { email, currentPassword, newPassword };
    const url = `${this.apiBase}/Corporate/ChangePassword`;

    return this.http
      .post<ChangePasswordResponse>(url, payload, { headers: this.defaultHeaders })
      .pipe(catchError(this.handleError));
  }

  createUser(payload: CreateUserRequest): Observable<CreateUserResponse> {
    const url = `${this.apiBase}/Corporate/CreateNewUser`;

    return this.http
      .post<CreateUserResponse>(url, payload, { headers: this.defaultHeaders })
      .pipe(catchError(this.handleError));
  }

  /**
   * Clear ALL client-side storage and return the user to the home page.
   *
   * @param redirect    When true (default) the user is navigated to `redirectUrl`.
   * @param redirectUrl Target URL after logout. Defaults to the app root (`/`).
   * @param hardReload  When true (default) a full page reload is performed via
   *                    `window.location` so any in-memory component / service
   *                    state is also reset. Pass `false` to use Angular's
   *                    Router (e.g. inside unit tests).
   */
  logout(
    redirect: boolean = true,
    redirectUrl: string = '/',
    hardReload: boolean = true
  ): void {
    try {
      localStorage.clear();
    } catch {
      // Fallback: at least clear the keys we know about.
      Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUserName');
      localStorage.removeItem('adminUser');
    }

    try {
      sessionStorage.clear();
    } catch {
      // ignore — sessionStorage may be unavailable in some environments (e.g. SSR)
    }

    if (!redirect) {
      return;
    }

    if (hardReload && typeof window !== 'undefined' && window.location) {
      // Hard redirect — ensures every singleton service / cached component
      // state is rebuilt from scratch, so menus cannot keep working post-logout.
      window.location.href = redirectUrl;
      return;
    }

    this.router.navigateByUrl(redirectUrl);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.token);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && token.trim().length > 0;
  }

  getUserId(): number | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.userId);
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }

  getUserName(): string {
    return localStorage.getItem(AUTH_STORAGE_KEYS.name) || '';
  }

  getUserEmail(): string {
    return localStorage.getItem(AUTH_STORAGE_KEYS.email) || '';
  }

  getOrgId(): number | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.orgId);
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private persistSession(response: LoginResponse): void {
    const { token, userId, name, email, orgId } = response.data;
    localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.userId, String(userId ?? ''));
    localStorage.setItem(AUTH_STORAGE_KEYS.name, name ?? '');
    localStorage.setItem(AUTH_STORAGE_KEYS.email, email ?? '');
    localStorage.setItem(AUTH_STORAGE_KEYS.orgId, String(orgId ?? ''));
    // Keep legacy flags in sync so existing screens keep working.
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUserName', name ?? '');
    localStorage.setItem('UserProfile', JSON.stringify(response.data));
  }

  private handleError = (error: HttpErrorResponse) => {
    let message = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message || message;
    } else if (typeof error.error === 'string' && error.error.trim().length > 0) {
      message = error.error;
    } else if (error.error && typeof error.error === 'object' && error.error.message) {
      message = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          message = 'Network error. Please check your internet connection.';
          break;
        case 400:
          message = 'Invalid request. Please verify your input.';
          break;
        case 401:
          message = 'Invalid credentials or session expired.';
          break;
        case 403:
          message = 'You are not authorized to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = error.message || message;
      }
    }

    return throwError(() => ({ status: error.status, message, raw: error }));
  };
}
