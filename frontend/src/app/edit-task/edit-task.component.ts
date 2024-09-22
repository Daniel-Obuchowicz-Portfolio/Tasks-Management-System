import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute } from '@angular/router'; // ActivatedRoute to get task ID
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
  taskId: number | null = null; // To hold the task ID
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  username: string | null = 'Admin';
  searchResults: any[] = []; // Store search results for users
  selectedUsers: any[] = []; // Store selected users
  
  currentDate: Date = new Date();  // Initialize with current date

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
      assignedUsers: [
        [], Validators.required
      ], // Array for multiple users
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Get task ID from URL and fetch task details
    this.taskId = Number(this.route.snapshot.paramMap.get('id')); // Getting task ID from the route
    if (this.taskId) {
      this.fetchTaskDetails(this.taskId);
    }
  }

  // Fetch task details and populate the form
  fetchTaskDetails(id: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.http.get<any>(`/api/tasks/${id}`, { headers }).subscribe(
      (task) => {
        // Populate the form with the current task details
        this.editTaskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        });
  
        // Map the user IDs to their corresponding usernames
        this.selectedUsers = task.assignedUsernames.map((username: string, index: number) => ({
          id: task.assignedUsers[index],  // Powinno przypisać odpowiednie ID
          username
        }));        
        

        this.editTaskForm.patchValue({
          assignedUsers: this.selectedUsers.map(u => u.id)
        });
      },
      (error) => {
        this.errorMessage = 'Error fetching task details';
        console.error('Error fetching task details:', error);
      }
    );
  }
  
  // Handle task update form submission
  onSubmit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    if (this.editTaskForm.valid && this.taskId) {
      this.isLoading = true;
      const formData = {
        ...this.editTaskForm.value,
        assignedUsers: this.selectedUsers.map(u => u.id)  // Upewnij się, że wysyłasz ID użytkowników
      };
  
      // Usuń cudzysłowy wokół `assignedUsers` przed wysłaniem danych
      console.log('Form Data to be sent:', formData);  // Sprawdzenie, jak dane wyglądają przed wysłaniem
  
      this.http.put(`/api/tasks/${this.taskId}`, formData, { headers }).subscribe(
        (response) => {
          this.successMessage = 'Task updated successfully!';
          this.isLoading = false;
        },
        (error) => {
          this.errorMessage = 'Failed to update task.';
          this.isLoading = false;
          console.error('Error updating task:', error);
        }
      );
    }
  }
  
  // Search for users by input
  searchUsers(event: Event) {
    const inputElement = event.target as HTMLInputElement | null;

    if (!inputElement) {
      console.error("Input element not found.");
      return;
    }

    const query = inputElement.value.trim();
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });

    this.http.get<any[]>(`/api/users/search?q=${encodeURIComponent(query)}`, { headers })
      .subscribe(
        (results) => {
          this.searchResults = results;
        },
        (error) => {
          console.error('Error searching users:', error);
        }
      );
  }

  // Select a user from the search results
  selectUser(user: any) {
    // Add the selected user if not already selected
    if (!this.selectedUsers.find(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }

    // Update the assignedUsers field with the selected user IDs
    this.editTaskForm.patchValue({
      assignedUsers: this.selectedUsers.map(u => u.id)
    });

    // Remove the selected user from search results
    this.searchResults = this.searchResults.filter(u => u.id !== user.id);
  }
  
  // Remove a user from the selected list
  removeUser(userId: number) {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== userId);

    this.editTaskForm.patchValue({
      assignedUsers: this.selectedUsers.map(u => u.id)
    });
  }
}
