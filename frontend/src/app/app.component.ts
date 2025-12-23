import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n/i18n.config';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthStateService } from './services/state/auth-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'above-sky-calendar-frontend';
  
  private router = inject(Router);
  protected authState = inject(AuthStateService);
  showSidebar = signal(false);

  constructor(private translate: TranslateService) {
    // Register available languages
    this.translate.addLangs(SUPPORTED_LANGUAGES.map(lang => lang.code));
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    
    // Monitor route changes to show/hide sidebar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Hide sidebar on login and register pages
        const hideOnRoutes = ['/login', '/register'];
        this.showSidebar.set(!hideOnRoutes.some(route => event.url.startsWith(route)));
      });
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
    
    // Set initial sidebar visibility
    const hideOnRoutes = ['/login', '/register'];
    this.showSidebar.set(!hideOnRoutes.some(route => this.router.url.startsWith(route)));
  }
}

