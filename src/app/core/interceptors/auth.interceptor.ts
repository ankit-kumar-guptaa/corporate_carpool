import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AUTH_STORAGE_KEYS } from '../models/auth.models';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);

    if (!token || req.headers.has('Authorization')) {
      return next.handle(req).pipe(
        catchError((err: HttpErrorResponse) => this.handle401(err))
      );
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => this.handle401(err))
    );
  }

  private handle401(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      try { localStorage.clear(); } catch { /* ignore */ }
      try { sessionStorage.clear(); } catch { /* ignore */ }
      this.router.navigate(['/']);
    }
    return throwError(() => error);
  }
}
