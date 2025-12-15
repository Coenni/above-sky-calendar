import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n/i18n.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'above-sky-calendar-frontend';

  constructor(private translate: TranslateService) {
    // Register available languages
    this.translate.addLangs(SUPPORTED_LANGUAGES.map(lang => lang.code));
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
  }

  ngOnInit(): void {
    // Get saved language from localStorage or use browser language or default
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang();
    
    if (savedLanguage) {
      this.translate.use(savedLanguage);
    } else if (browserLang && SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang)) {
      this.translate.use(browserLang);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, browserLang);
    } else {
      this.translate.use(DEFAULT_LANGUAGE);
    }
  }
}

