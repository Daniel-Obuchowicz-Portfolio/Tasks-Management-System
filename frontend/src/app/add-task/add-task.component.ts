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
      assignedUsers: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['pending', Validators.required],
      dueDate: ['', Validators.required]  // Make sure this is part of the form
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
      const formData = this.addTaskForm.value;

      this.http.post('/api/tasks/create', formData, { headers }).subscribe(
        response => {
          this.successMessage = 'Task added successfully!';
          this.addTaskForm.reset();
          this.isLoading = false;
        },
        error => {
          this.errorMessage = 'Failed to add task.';
          this.isLoading = false;
        }
      );
    } else {
      // Log form errors for debugging
      console.error('Form is invalid:', this.addTaskForm.errors);
      this.errorMessage = 'Please fill out all required fields correctly.';
    }
  }
}
