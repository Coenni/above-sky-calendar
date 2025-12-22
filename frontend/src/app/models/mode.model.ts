export interface ModeResponse {
  isParentMode: boolean;
  hasPinSet: boolean;
}

export interface ModeSwitchRequest {
  targetMode: 'PARENT' | 'SILENT';
  pin?: string;
}

export interface PinSetupRequest {
  currentPin?: string;
  newPin: string;
}

export interface PinResetRequest {
  token: string;
  newPin: string;
}

export interface MessageResponse {
  message: string;
}
