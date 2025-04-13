// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.currentUserValue;
    
    if (user) {
      // Check if route has role requirement
      if (route.data['roles'] && !route.data['roles'].includes(user.role)) {
        this.toastService.error('You do not have permission to access this page');
        this.router.navigate(['/']);
        return false;
      }
      
      // Logged in, so return true
      return true;
    }

    // Not logged in, redirect to login page with returnUrl
    this.toastService.error('You need to login first');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}