import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [CommonModule],  // Jeśli potrzebujesz modułu CommonModule dla dyrektyw, jak *ngFor
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.css']  // Zwróć uwagę na "styleUrls", a nie "styleUrl"
})
export class CalendarWidgetComponent implements OnInit {
  events: any[] = [];  // Lista wydarzeń na dzisiaj
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchTodayEvents();  // Pobieranie wydarzeń przy inicjalizacji komponentu
  }

  // Pobieranie wydarzeń na dzisiaj dla zalogowanego użytkownika
  fetchTodayEvents() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.isLoading = true;

    this.http.get<any[]>('/api/tasks/get/today', { headers }).subscribe(
      (response) => {
        this.events = response;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching today\'s events';
        console.error('Error fetching events:', error);
        this.isLoading = false;
      }
    );
  }
}
