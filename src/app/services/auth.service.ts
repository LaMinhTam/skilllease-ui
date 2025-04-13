// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.post<any>('/auth/login', { email, password })
      .pipe(
        tap(response => {
          // Extract data from the response
          const { accessToken, refreshToken, userResponseDTO } = response.data;
          
          // Create user object
          const userData: User = {
            id: userResponseDTO.id,
            fullName: userResponseDTO.fullName,
            email: userResponseDTO.email,
            role: userResponseDTO.role,
            cvUrl: userResponseDTO.cvUrl,
            profilePictureUrl: userResponseDTO.profilePictureUrl,
            accessToken,
            refreshToken
          };
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update the BehaviorSubject
          this.currentUserSubject.next(userData);
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.apiService.post<any>('/auth/register', userData)
      .pipe(
        tap(response => {
          // Extract data from the response
          const { accessToken, refreshToken, userResponseDTO } = response.data;
          
          // Create user object
          const newUser: User = {
            id: userResponseDTO.id,
            fullName: userResponseDTO.fullName,
            email: userResponseDTO.email,
            role: userResponseDTO.role,
            cvUrl: userResponseDTO.cvUrl,
            profilePictureUrl: userResponseDTO.profilePictureUrl,
            accessToken,
            refreshToken
          };
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(newUser));
          
          // Update the BehaviorSubject
          this.currentUserSubject.next(newUser);
        })
      );
  }

  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('user');
    
    // Update the BehaviorSubject
    this.currentUserSubject.next(null);
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}