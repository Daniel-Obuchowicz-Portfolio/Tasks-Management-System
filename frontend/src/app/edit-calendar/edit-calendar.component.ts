import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { CommonModule } from '@angular/common';  // Import CommonModule for ngIf and ngFor
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  selector: 'app-edit-calendar',
  templateUrl: './edit-calendar.component.html',
  styleUrls: ['./edit-calendar.component.css'],
  imports: [FormsModule, CommonModule, CalendarWidgetComponent]  // Add CommonModule and FormsModule to imports
})
export class EditCalendarComponent {
  @Input() event: any;  // Event details passed into the component
  @Output() close = new EventEmitter<void>();  // Emit event to close the modal
  @Output() eventUpdated = new EventEmitter<any>();  // Emit event when the event is updated

  searchResults: any[] = [];  // Holds user search results
  selectedUsers: any[] = [];  // Holds selected users

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize selected users based on event.userIds (comma-separated string)
    if (this.event && this.event.userIds) {
      // Split the userIds string into an array, fetch the actual usernames
      const userIdArray = this.event.userIds.split(',').map(Number);  // Convert to an array of numbers
      this.fetchUserDetails(userIdArray);  // Fetch user details based on the IDs
    }

    if (this.event && this.event.date) {
      const date = new Date(this.event.date);
      this.event.date = date.toISOString().slice(0, 16);  // Format to 'YYYY-MM-DDTHH:MM'
    }
  }

  // Fetch usernames from backend for the given userIds
  fetchUserDetails(userIds: number[]) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    });

    // Fetch user details for each userId from the backend
    this.http.post<any[]>('/api/users/byIds', { userIds }, { headers }).subscribe(
      (users) => {
        this.selectedUsers = users.map(user => ({
          id: user.id,
          username: user.username
        }));
        console.log('Selected Users:', this.selectedUsers);  // Debugging
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  // Search for users in the backend
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

  // Add selected user to the list
  selectUser(user: any) {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.searchResults = [];  // Clear search results after selection
  }

  // Remove user from the selected list
  removeUser(userId: number) {
    this.selectedUsers = this.selectedUsers.filter(user => user.id !== userId);
  }

  // Submit the form and update the event
  submitForm() {
    // Convert date to MySQL format: 'YYYY-MM-DD HH:MM:SS'
    const date = new Date(this.event.date).toISOString().slice(0, 19).replace('T', ' ');  // Format the date correctly
    this.event.date = date;
  
    this.event.userIds = this.selectedUsers.map(user => user.id).join(',');  // Convert selected users back to a string
  
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
    this.close.emit();  // Close the modal
  }

  
}
