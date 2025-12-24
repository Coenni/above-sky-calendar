import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, shareReplay, of } from 'rxjs';
import { ApiService } from './api.service';
import { 
  ModeResponse, 
  ModeSwitchRequest, 
  PinSetupRequest, 
  PinResetRequest, 
  MessageResponse 
} from '../models/mode.model';

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  private readonly MODE_KEY = 'user_mode';
  private modeSubject = new BehaviorSubject<ModeResponse | null>(null);
  public mode$ = this.modeSubject.asObservable();
  private modeRequest$: Observable<ModeResponse> | null = null;

  constructor(private apiService: ApiService) {
    this.loadModeFromStorage();
  }

  /**
   * Load mode from localStorage on service initialization
   */
  private loadModeFromStorage(): void {
    const savedMode = localStorage.getItem(this.MODE_KEY);
    if (savedMode) {
      try {
        this.modeSubject.next(JSON.parse(savedMode));
      } catch (e) {
        console.error('Error parsing saved mode', e);
        localStorage.removeItem(this.MODE_KEY);
      }
    }
  }

  /**
   * Save mode to localStorage
   */
  private saveModeToStorage(mode: ModeResponse): void {
    localStorage.setItem(this.MODE_KEY, JSON.stringify(mode));
    this.modeSubject.next(mode);
  }

  /**
   * Get current mode from the server (with caching to prevent duplicate requests)
   */
  getCurrentMode(forceRefresh: boolean = false): Observable<ModeResponse> {
    // If we have cached data and not forcing refresh, return cached data immediately
    const cachedMode = this.modeSubject.value;
    if (!forceRefresh && cachedMode) {
      return of(cachedMode);
    }

    // If there's already a pending request, return it (shareReplay prevents duplicate calls)
    if (this.modeRequest$) {
      return this.modeRequest$;
    }

    // Create new request and cache it
    this.modeRequest$ = this.apiService.get<ModeResponse>('/settings/mode').pipe(
      tap(mode => this.saveModeToStorage(mode)),
      shareReplay(1),
      tap(() => {
        // Clear the cached request after a short delay so subsequent calls can use cache
        setTimeout(() => {
          this.modeRequest$ = null;
        }, 1000);
      })
    );

    return this.modeRequest$;
  }

  /**
   * Switch mode between Parent and Silent
   */
  switchMode(request: ModeSwitchRequest): Observable<ModeResponse> {
    return this.apiService.post<ModeResponse>('/settings/mode', request).pipe(
      tap(mode => this.saveModeToStorage(mode))
    );
  }

  /**
   * Set up or update PIN
   */
  setupPin(request: PinSetupRequest): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('/settings/pin', request);
  }

  /**
   * Request PIN reset email
   */
  requestPinReset(): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('/settings/pin/reset-request', {});
  }

  /**
   * Reset PIN with token
   */
  resetPin(request: PinResetRequest): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('/settings/pin/reset', request);
  }

  /**
   * Check if currently in Parent Mode
   */
  isParentMode(): boolean {
    const mode = this.modeSubject.value;
    return mode?.isParentMode ?? false;
  }

  /**
   * Check if PIN has been set
   */
  hasPinSet(): boolean {
    const mode = this.modeSubject.value;
    return mode?.hasPinSet ?? false;
  }

  /**
   * Get current mode value
   */
  getCurrentModeValue(): ModeResponse | null {
    return this.modeSubject.value;
  }

  /**
   * Clear mode data (on logout)
   */
  clearMode(): void {
    localStorage.removeItem(this.MODE_KEY);
    this.modeSubject.next(null);
  }
}
