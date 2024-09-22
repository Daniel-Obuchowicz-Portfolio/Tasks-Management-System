import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';  // Import CommonModule
import { ActivatedRoute, RouterModule  } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http'; // Import HttpClient and HttpClientModule
import { HeaderComponent } from '../header/header.component';  // Import your header component
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';


@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, HeaderComponent, RouterModule, CalendarWidgetComponent],  // Add HttpClientModule here
  selector: 'app-user-details',
  templateUrl: './users-details.component.html',
  styleUrls: ['./users-details.component.css'],
})
export class UserDetailsComponent implements OnInit {
  userId: number | null = null;
  user: any = null;
  errorMessage: string | null = null;  // For displaying errors
  users: any[] = [];
  username: string | null = 'Admin'; 

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object  // Inject PLATFORM_ID
  ) {}

  ngOnInit() {
    // Get the user ID from the route
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.userId) {
      this.fetchUserDetails(this.userId);
    } else {
      this.errorMessage = 'Invalid user ID';
    }
  }

  // Fetch the user details from the backend
  fetchUserDetails(id: number) {
    // Ensure this code runs only in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');  // Retrieve token from localStorage
  
      if (!token) {
        this.errorMessage = 'No token found, please log in';  // Show error message if no token is found
        console.error(this.errorMessage);
        return;
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`  // Attach token to Authorization header
      });
  
      this.http.get(`/api/users/by/${id}`, { headers }).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          this.errorMessage = 'Error fetching user details';  // Display error message on the UI
          console.error('Error fetching user details:', error);
        }
      );
    } else {
      console.error('localStorage is not available on the server-side');
    }
  }
}
