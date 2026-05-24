import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule, CalendarWidgetComponent, HeaderComponent],  // Include HttpClientModule here
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  addTaskForm: FormGroup;
  users: any[] = [];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  username: string | null = 'Admin'; 

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.addTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      assignedUsers: [[], Validators.required],
      priority: ['medium', Validators.required],
      status: ['open', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchUsers();  // Fetch users on initialization
  }

  fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('/api/users', { headers }).subscribe(
      (response) => {
        this.users = response;
      },
      (error) => {
        this.errorMessage = 'Error fetching users';
        console.error('Error fetching users:', error);
      }
    );
  }

  onSubmit() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please log in');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (this.addTaskForm.valid) {
      this.isLoading = true;
      const formData = {
        ...this.addTaskForm.value,
        assignedUsers: (this.addTaskForm.value.assignedUsers || []).map((userId: string | number) => Number(userId))
      };

      this.http.post('/api/tasks/create', formData, { headers }).subscribe(
        response => {
          this.successMessage = 'Task added successfully!';
          this.addTaskForm.reset({
            title: '',
            description: '',
            assignedUsers: [],
            priority: 'medium',
            status: 'open',
            dueDate: ''
          });
          this.isLoading = false;
        },
        error => {
          this.errorMessage = 'Failed to add task.';
          this.isLoading = false;
        }
      );
    } else {
      this.addTaskForm.markAllAsTouched();
      console.error('Form is invalid:', this.getControlErrors());
      this.errorMessage = 'Please fill out all required fields correctly.';
    }
  }

  private getControlErrors() {
    return Object.entries(this.addTaskForm.controls).reduce((acc, [key, control]) => {
      if (control.invalid) {
        acc[key] = control.errors;
      }
      return acc;
    }, {} as Record<string, unknown>);
  }
}
