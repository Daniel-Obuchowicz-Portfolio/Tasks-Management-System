import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf and ngFor

@Component({
  standalone: true,
  selector: 'app-edit-calendar',
  templateUrl: './edit-calendar.component.html',
  styleUrls: ['./edit-calendar.component.css'],
  imports: [FormsModule, CommonModule]  // Add CommonModule and FormsModule to imports
})
export class EditCalendarComponent {
  @Input() event: any;  // Event details passed into the component
  @Output() close = new EventEmitter<void>();  // Emit event to close the modal
  @Output() eventUpdated = new EventEmitter<any>();  // Emit event when the event is updated

  searchResults: any[] = [];  // Holds user search results
  selectedUsers: any[] = [];  // Holds selected users

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize selected users based on event.userIds
    if (this.event && this.event.userIds) {
      this.selectedUsers = this.event.userIds.map((id: number) => ({ id, username: `User ${id}` }));
    }
  }

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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    });

    this.http.get<any[]>(`/api/users/search?q=${encodeURIComponent(query)}`, { headers }).subscribe(
      (results) => {
        this.searchResults = results; // Update searchResults with the API response
        console.log('Search Results:', this.searchResults); // Debugging
      },
      (error) => {
        console.error('Error searching users:', error);
      }
    );
  }

  selectUser(user: any) {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.searchResults = [];  // Clear search results after selection
  }

  removeUser(userId: number) {
    this.selectedUsers = this.selectedUsers.filter(user => user.id !== userId);
  }

  submitForm() {
    this.event.userIds = this.selectedUsers.map(user => user.id);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.put(`/api/events/${this.event.id}`, this.event, { headers }).subscribe(
      (updatedEvent) => {
        this.eventUpdated.emit(updatedEvent);  // Emit the updated event back to parent
        this.closeModal();  // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating event:', error);
      }
    );
  }

  closeModal() {
    this.close.emit();
  }
}
