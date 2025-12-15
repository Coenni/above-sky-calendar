import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  // Private writable signals
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal(false);
  private _token = signal<string | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly token = this._token.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals
  readonly userDisplayName = computed(() => {
    const user = this._currentUser();
    return user?.displayName || user?.username || 'Guest';
  });
  
  readonly userPoints = computed(() => 
    this._currentUser()?.rewardPoints || 0
  );
  
  readonly isParent = computed(() => 
    this._currentUser()?.isParent === true
  );
  
  readonly userRoles = computed(() => {
    const user = this._currentUser();
    if (!user?.roles) return [];
    return user.roles.split(',').map(r => r.trim());
  });
  
  readonly hasAdminRole = computed(() => 
    this.userRoles().includes('ADMIN')
  );
  
  readonly userInfo = computed(() => {
    const user = this._currentUser();
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: this.userDisplayName(),
      points: this.userPoints(),
      isParent: this.isParent(),
      roles: this.userRoles()
    };
  });
  
  constructor() {
    // Check for existing token on initialization
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
      try {
        this._token.set(savedToken);
        this._currentUser.set(JSON.parse(savedUser));
        this._isAuthenticated.set(true);
      } catch (e) {
        // Clear invalid data
        this.logout();
      }
    }
  }
  
  // Methods to update state
  login(token: string, user: User) {
    this._token.set(token);
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    this._error.set(null);
    
    // Persist to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  
  logout() {
    this._token.set(null);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._error.set(null);
    
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
  
  updateUser(updates: Partial<User>) {
    this._currentUser.update(user => {
      if (!user) return null;
      const updated = { ...user, ...updates };
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    });
  }
  
  updateUserPoints(points: number) {
    this.updateUser({ rewardPoints: points });
  }
  
  addUserPoints(points: number) {
    this._currentUser.update(user => {
      if (!user) return null;
      const updated = { ...user, rewardPoints: (user.rewardPoints || 0) + points };
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updated));
      return updated;
    });
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  refreshUser(user: User) {
    this._currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
