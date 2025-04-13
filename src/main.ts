// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from './app/components/custom-snackbar/custom-snackbar.component';

// Create a custom interceptor function to handle auth
const authInterceptor = (req: any, next: any) => {
  // Get the user from localStorage
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    
    // If user has an access token, add it to the request headers
    if (user && user.accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${user.accessToken}`
        }
      });
    }
  }
  
  return next(req);
};

// Register services for dependency injection
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(MatSnackBarModule)
  ]
}).catch(err => console.error(err));