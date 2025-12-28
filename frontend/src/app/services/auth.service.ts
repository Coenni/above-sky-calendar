import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { ModeService } from './mode.service';
import { AuthStateService } from './state/auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser';
  private authStateService = inject(AuthStateService);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private modeService: ModeService
  ) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', request).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        // Load user mode after login
        this.modeService.getCurrentMode().subscribe({
          error: (err) => console.error('Failed to load user mode', err)
        });
      })
    );
  }

  logout(): void {
    this.authStateService.logout(); // AuthStateService handles localStorage cleanup
    this.modeService.clearMode();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private handleAuthResponse(response: AuthResponse): void {
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      displayName: response.username,
      rewardPoints: 0,
      isParent: false
    };
    
    // AuthStateService handles localStorage persistence
    this.authStateService.login(response.token, user);
  }
}
