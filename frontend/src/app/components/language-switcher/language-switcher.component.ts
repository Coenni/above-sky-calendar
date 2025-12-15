import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../../i18n/i18n.config';

/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 * Persists language preference in localStorage
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent implements OnInit {
  languages = SUPPORTED_LANGUAGES;
  currentLanguage: string = DEFAULT_LANGUAGE;
  isOpen = false;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Get saved language from localStorage or use default
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      this.currentLanguage = DEFAULT_LANGUAGE;
    }
    
    // Set the language
    this.translate.use(this.currentLanguage);
  }

  /**
   * Check if a language code is supported
   */
  private isLanguageSupported(code: string): boolean {
    return this.languages.some(lang => lang.code === code);
  }

  /**
   * Switch to a new language
   */
  switchLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguage = languageCode;
      this.translate.use(languageCode);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      this.isOpen = false;
    }
  }

  /**
   * Toggle dropdown
   */
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Get the current language object
   */
  getCurrentLanguage() {
    return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
  }
}
