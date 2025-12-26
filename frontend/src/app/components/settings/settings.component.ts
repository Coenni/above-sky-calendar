import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ModeService } from '../../services/mode.service';
import { ModeSwitchRequest } from '../../models/mode.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private modeService = inject(ModeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isParentMode = signal(false);
  hasPinSet = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  // Dialog states
  showPinSetup = signal(false);
  showPinEntry = signal(false);
  showForgotPin = signal(false);
  showLogoutConfirm = signal(false);
  
  // Form inputs
  pin = signal('');
  newPin = signal('');
  confirmPin = signal('');
  currentPin = signal('');

  ngOnInit(): void {
    this.loadMode();
  }

  loadMode(): void {
    // First try to use cached mode value, then fetch if needed
    const cachedMode = this.modeService.getCurrentModeValue();
    if (cachedMode) {
      this.isParentMode.set(cachedMode.isParentMode);
      this.hasPinSet.set(cachedMode.hasPinSet);
    }

    // Fetch fresh data from server
    this.modeService.getCurrentMode(false).subscribe({
      next: (mode) => {
        this.isParentMode.set(mode.isParentMode);
        this.hasPinSet.set(mode.hasPinSet);
      },
      error: (err) => {
        console.error('Failed to load mode', err);
        this.error.set('Failed to load mode settings');
      }
    });
  }

  switchToParentMode(): void {
    if (!this.hasPinSet()) {
      this.error.set('Please set a PIN first');
      this.showPinSetup.set(true);
      return;
    }
    this.showPinEntry.set(true);
  }

  switchToSilentMode(): void {
    this.loading.set(true);
    this.error.set(null);
    
    const request: ModeSwitchRequest = {
      targetMode: 'SILENT'
    };
    
    this.modeService.switchMode(request).subscribe({
      next: (mode) => {
        this.isParentMode.set(mode.isParentMode);
        this.hasPinSet.set(mode.hasPinSet);
        this.success.set('Switched to Silent Mode');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to switch mode', err);
        this.error.set('Failed to switch to Silent Mode');
        this.loading.set(false);
      }
    });
  }

  submitPin(): void {
    const enteredPin = this.pin();
    if (enteredPin.length !== 4) {
      this.error.set('PIN must be 4 digits');
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    
    const request: ModeSwitchRequest = {
      targetMode: 'PARENT',
      pin: enteredPin
    };
    
    this.modeService.switchMode(request).subscribe({
      next: (mode) => {
        this.isParentMode.set(mode.isParentMode);
        this.hasPinSet.set(mode.hasPinSet);
        this.success.set('Switched to Parent Mode');
        this.showPinEntry.set(false);
        this.pin.set('');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to switch mode', err);
        this.error.set('Invalid PIN');
        this.loading.set(false);
      }
    });
  }

  setupNewPin(): void {
    const newPinValue = this.newPin();
    const confirmPinValue = this.confirmPin();
    const currentPinValue = this.currentPin();
    
    if (newPinValue.length !== 4 || !/^\d{4}$/.test(newPinValue)) {
      this.error.set('PIN must be exactly 4 digits');
      return;
    }
    
    if (newPinValue !== confirmPinValue) {
      this.error.set('PINs do not match');
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    
    const request = this.hasPinSet() 
      ? { currentPin: currentPinValue, newPin: newPinValue }
      : { newPin: newPinValue };
    
    this.modeService.setupPin(request).subscribe({
      next: () => {
        this.success.set('PIN set successfully');
        this.showPinSetup.set(false);
        this.newPin.set('');
        this.confirmPin.set('');
        this.currentPin.set('');
        this.loading.set(false);
        this.loadMode(); // Reload mode to update hasPinSet
      },
      error: (err) => {
        console.error('Failed to set PIN', err);
        this.error.set(err.error?.message || 'Failed to set PIN');
        this.loading.set(false);
      }
    });
  }

  requestPinReset(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.modeService.requestPinReset().subscribe({
      next: () => {
        this.success.set('Reset email sent! Check your email.');
        this.showForgotPin.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to request PIN reset', err);
        this.error.set('Failed to send reset email');
        this.loading.set(false);
      }
    });
  }

  closePinEntry(): void {
    this.showPinEntry.set(false);
    this.pin.set('');
    this.error.set(null);
  }

  closePinSetup(): void {
    this.showPinSetup.set(false);
    this.newPin.set('');
    this.confirmPin.set('');
    this.currentPin.set('');
    this.error.set(null);
  }

  closeForgotPin(): void {
    this.showForgotPin.set(false);
    this.error.set(null);
  }

  openForgotPin(): void {
    this.showPinEntry.set(false);
    this.showForgotPin.set(true);
  }

  logout(): void {
    this.showLogoutConfirm.set(true);
  }

  closeLogoutConfirm(): void {
    this.showLogoutConfirm.set(false);
  }

  async confirmLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
