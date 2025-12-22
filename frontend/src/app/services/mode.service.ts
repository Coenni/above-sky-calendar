import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
   * Get current mode from the server
   */
  getCurrentMode(): Observable<ModeResponse> {
    return this.apiService.get<ModeResponse>('/settings/mode').pipe(
      tap(mode => this.saveModeToStorage(mode))
    );
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
