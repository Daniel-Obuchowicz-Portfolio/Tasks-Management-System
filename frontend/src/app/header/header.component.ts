import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngIf

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() title: string = 'Dashboard';  // Dynamic title for the header
  @Input() username: string | null = 'Guest';  // Dynamic username (optional)
  currentDate = new Date().toLocaleDateString(); 
  
  constructor(private router: Router) {}

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);  // Navigate to the login page
  }
}
