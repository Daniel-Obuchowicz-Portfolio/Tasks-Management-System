import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [HeaderComponent, CalendarWidgetComponent],  // Import the shared HeaderComponent
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  username: string | null = 'Admin';  // Example username, you can get this dynamically
}
