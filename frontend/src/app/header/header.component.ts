import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';  // Import RouterModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // FormsModule dla ngModel
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,  // FormsModule dla ngModel
    RouterModule,  // RouterModule dla routerLink
    TranslateModule  // TranslateModule, bez .forRoot()
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() title: string = 'Dashboard';
  @Input() username: string | null = 'Guest';
  @Input() email: string | null = 'guest@example.com';

  isDarkMode = false;
  selectedLanguage = 'en';

  constructor(private translate: TranslateService) {
    this.translate.use('en');  // Domyślny język
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    
    // Dodaj lub usuń klasę `dark-mode` na elemencie <body>
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }


  changeLanguage(lang: string) {
    this.translate.use(lang);  // Zmiana języka
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
}
