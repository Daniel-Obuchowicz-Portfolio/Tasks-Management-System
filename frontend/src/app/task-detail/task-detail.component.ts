import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // ActivatedRoute to get task ID
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Import HttpClientModule
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
  imports: [CommonModule, HeaderComponent, RouterModule, HttpClientModule] // Add HttpClientModule here
})
export class TaskDetailComponent implements OnInit {
  task: any = null;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.fetchTaskDetails(taskId);
    }
  }

  fetchTaskDetails(taskId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    this.http.get<any>(`/api/tasks/${taskId}`, { headers }).subscribe(
      (task) => {
        this.task = task;
        console.log(this.task); // Log to check if task contains status and priority
      },
      (error) => {
        this.errorMessage = 'Error fetching task details';
        console.error('Error fetching task details:', error);
      }
    );
  }
  
}
