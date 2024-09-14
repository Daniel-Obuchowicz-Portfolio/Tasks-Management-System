import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  imports: [HeaderComponent],  // Import the shared HeaderComponent
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  username: string | null = 'Admin';  // Example username, you can get this dynamically
}
