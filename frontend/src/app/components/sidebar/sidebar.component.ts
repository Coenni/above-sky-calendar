import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthStateService } from '../../services/state/auth-state.service';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private router = inject(Router);
  protected authState = inject(AuthStateService);
  private authService = inject(AuthService);
  
  isCollapsed = signal(false);
  currentRoute = signal('');

  navItems: NavItem[] = [
    { label: 'Calendar - View and manage events + tasks', route: '/calendar', icon: '📅' },
    { label: 'Tasks - Track family chores', route: '/tasks', icon: '✓' },
    { label: 'Rewards - Redeem points', route: '/rewards', icon: '🏆' },
    { label: 'Meals - Plan weekly meals', route: '/meals', icon: '🍽️' },
    { label: 'Photos - Share memories', route: '/photos', icon: '📷' },
    { label: 'Lists - Shopping & to-do lists', route: '/lists', icon: '📋' },
    { label: 'Family - Manage family members', route: '/family', icon: '👨‍👩‍👧‍👦' },
    { label: 'Settings', route: '/settings', icon: '⚙️' }
  ];

  constructor() {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
      });
    
    // Set initial route
    this.currentRoute.set(this.router.url);
  }

  toggleSidebar(): void {
    this.isCollapsed.update(v => !v);
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
