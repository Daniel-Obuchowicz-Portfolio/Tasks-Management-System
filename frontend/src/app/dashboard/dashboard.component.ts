import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    CalendarWidgetComponent,
    HttpClientModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  username: string | null = 'Admin';
  isDarkMode = false;
  selectedLanguage = 'en';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.selectedLanguage);
  }


  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
