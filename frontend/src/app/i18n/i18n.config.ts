import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * HttpLoader factory for ngx-translate
 * Loads translation files from public/locales directory
 */
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Supported languages configuration
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' }
];

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Local storage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'preferred_language';
