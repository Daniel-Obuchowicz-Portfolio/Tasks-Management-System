import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    CalendarWidgetComponent,
    HttpClientModule,
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string | null = 'Admin';
  stats = {
    totalTasks: 0,
    completedTasks: 0,
    openTasks: 0,
    users: 0
  };
  priorityBreakdown = { high: 0, medium: 0, low: 0 };
  todayItems: any[] = [];
  recentTasks: any[] = [];
  errorMessage: string | null = null;

  constructor(
    private translate: TranslateService,
    private http: HttpClient
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.loadDashboard();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadDashboard() {
    const headers = this.getHeaders();
    if (!headers) {
      return;
    }

    Promise.all([
      this.http.get<any>('/api/tasks?page=1&limit=1000', { headers }).toPromise(),
      this.http.get<any[]>('/api/users', { headers }).toPromise(),
      this.http.get<any[]>('/api/tasks/get/today', { headers }).toPromise()
    ])
      .then(([taskResponse, usersResponse, todayResponse]) => {
        const tasks = Array.isArray(taskResponse?.tasks) ? taskResponse.tasks : [];
        const users = Array.isArray(usersResponse) ? usersResponse : [];
        this.todayItems = Array.isArray(todayResponse) ? todayResponse.slice(0, 5) : [];
        this.recentTasks = [...tasks]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        this.stats.totalTasks = tasks.length;
        this.stats.completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
        this.stats.openTasks = tasks.filter((task: any) => task.status !== 'completed').length;
        this.stats.users = users.length;

        this.priorityBreakdown.high = tasks.filter((task: any) => task.priority === 'high').length;
        this.priorityBreakdown.medium = tasks.filter((task: any) => task.priority === 'medium').length;
        this.priorityBreakdown.low = tasks.filter((task: any) => task.priority === 'low').length;
      })
      .catch((error) => {
        this.errorMessage = 'Error loading dashboard';
        console.error('Error loading dashboard:', error);
      });
  }
}
