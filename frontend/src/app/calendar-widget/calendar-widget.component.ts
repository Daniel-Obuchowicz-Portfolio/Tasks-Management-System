import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.css']
})
export class CalendarWidgetComponent implements OnInit {
  events: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTodayEvents();
  }

  fetchTodayEvents() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.isLoading = true;

    this.http.get<any[]>('/api/tasks/get/today', { headers }).subscribe(
      (response) => {
        this.events = response;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching today\'s items';
        console.error('Error fetching today items:', error);
        this.isLoading = false;
      }
    );
  }
}
