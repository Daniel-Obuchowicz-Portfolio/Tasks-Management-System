import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() title = 'Dashboard';
  @Input() username: string | null = 'Guest';
  @Input() email: string | null = 'guest@example.com';

  selectedLanguage = 'en';
  navItems = [
    { route: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { route: '/users', icon: 'fas fa-users', label: 'Users' },
    { route: '/tasks', icon: 'fas fa-list-check', label: 'Tasks' },
    { route: '/calendar', icon: 'fas fa-calendar-days', label: 'Calendar' }
  ];

  constructor(
    private translate: TranslateService,
    private router: Router
  ) {
    this.translate.use('en');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
