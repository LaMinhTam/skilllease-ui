// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the user from localStorage
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // If user has an access token, add it to the request headers
      if (user && user.accessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${user.accessToken}`
          }
        });
      }
    }
    
    return next.handle(request);
  }
}