import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule, HeaderComponent, CalendarWidgetComponent],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  editTaskForm: FormGroup;
  taskId: number | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  username: string | null = 'Admin';
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  currentDate: Date = new Date();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.editTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      assignedUsers: [[], Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.taskId) {
      this.fetchTaskDetails(this.taskId);
    }
  }

  private formatDateTimeLocal(dateValue: string | null | undefined) {
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  fetchTaskDetails(id: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(`/api/tasks/${id}`, { headers }).subscribe(
      (task) => {
        this.editTaskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: this.formatDateTimeLocal(task.dueDate)
        });

        const assignedUserIds = typeof task.assignedUserIds === 'string'
          ? task.assignedUserIds.split(',').map((idValue: string) => Number(idValue))
          : [];

        this.selectedUsers = (task.assignedUsernames || []).map((username: string, index: number) => ({
          id: assignedUserIds[index],
          username
        }));

        this.editTaskForm.patchValue({
          assignedUsers: this.selectedUsers.map((user) => user.id)
        });
      },
      (error) => {
        this.errorMessage = 'Error fetching task details';
        console.error('Error fetching task details:', error);
      }
    );
  }

  onSubmit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    if (this.editTaskForm.valid && this.taskId) {
      this.isLoading = true;
      const formData = {
        ...this.editTaskForm.value,
        assignedUsers: this.selectedUsers.map((user) => Number(user.id))
      };

      this.http.put(`/api/tasks/${this.taskId}`, formData, { headers }).subscribe(
        () => {
          this.successMessage = 'Task updated successfully!';
          this.isLoading = false;
        },
        (error) => {
          this.errorMessage = 'Failed to update task.';
          this.isLoading = false;
          console.error('Error updating task:', error);
        }
      );
      return;
    }

    this.editTaskForm.markAllAsTouched();
  }

  searchUsers(event: Event) {
    const inputElement = event.target as HTMLInputElement | null;

    if (!inputElement) {
      console.error('Input element not found.');
      return;
    }

    const query = inputElement.value.trim();
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(`/api/users/search?q=${encodeURIComponent(query)}`, { headers }).subscribe(
      (results) => {
        this.searchResults = results;
      },
      (error) => {
        console.error('Error searching users:', error);
      }
    );
  }

  selectUser(user: any) {
    if (!this.selectedUsers.find((selectedUser) => selectedUser.id === user.id)) {
      this.selectedUsers.push(user);
    }

    this.editTaskForm.patchValue({
      assignedUsers: this.selectedUsers.map((selectedUser) => selectedUser.id)
    });

    this.searchResults = this.searchResults.filter((searchUser) => searchUser.id !== user.id);
  }

  removeUser(userId: number) {
    this.selectedUsers = this.selectedUsers.filter((selectedUser) => selectedUser.id !== userId);

    this.editTaskForm.patchValue({
      assignedUsers: this.selectedUsers.map((selectedUser) => selectedUser.id)
    });
  }
}
