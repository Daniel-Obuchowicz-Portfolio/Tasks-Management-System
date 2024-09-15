import {
  Component,
  OnInit
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpClientModule
} from '@angular/common/http'; // Import HttpClient
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms'; // Import FormsModule and ReactiveFormsModule
import {
  CommonModule
} from '@angular/common'; // CommonModule for common Angular features
import {
  RouterModule
} from '@angular/router';
import {
  HeaderComponent
} from '../header/header.component'; // Import shared HeaderComponent

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  userIds: string[]; // Array of selected user IDs
}

interface User {
  id: number;
  username: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HttpClientModule, HeaderComponent], // Ensure FormsModule is imported here
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  username: string | null = 'Admin';
  events: Event[] = []; // Ensure events is an array
  newEvent: Event = {
    id: 0,
    title: '',
    date: '',
    description: '',
    userIds: []
  }; // Model for creating a new event
  editingEvent: Event | null = null; // Holds the event being edited
  searchResults: User[] = []; // Stores the search results
  selectedUsers: User[] = []; // Stores selected users

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getEvents();
  }

  // Retrieve Authorization headers with token
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in.');
      throw new Error('No token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Ensure the token is prefixed by 'Bearer '
      'Content-Type': 'application/json'
    });
  }


  // Fetch all events from the API
  getEvents() {
    const headers = this.getHeaders();
    this.http.get < any > ('/api/events', {
      headers
    }).subscribe(
      (data) => {
        console.log('Fetched events:', data); // Log fetched events to check the structure
        this.events = data.events || []; // Ensure we get the array from the events field in the response
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  // Add a new event
  addEvent() {
    const headers = this.getHeaders();
  
    if (!this.newEvent.title || !this.newEvent.date || this.selectedUsers.length === 0) {
      console.warn('Event title, date, and assigned users are required');
      return;  // Validate event title, date, and selected users before submitting
    }
  
    // Add selected user IDs to the event as an array
    this.newEvent.userIds = this.selectedUsers.map(user => user.id.toString());
  
    // Log the userIds array to check if it's correctly formatted
    console.log(this.newEvent.userIds);
  
    this.http.post<Event>('/api/events', this.newEvent, { headers }).subscribe(
      (event) => {
        this.events.push(event);  // Add new event to the events list
        this.newEvent = { id: 0, title: '', date: '', description: '', userIds: [] };  // Reset form
        this.selectedUsers = [];  // Reset selected users
      },
      (error) => {
        console.error('Error adding event:', error);
      }
    );
  }
  
  

  // Search for users (called on input change)
  // Search for users (called on input change)
  searchUsers(event: any) { // Use `any` for the event type to avoid the error
    const inputElement = event.target as HTMLInputElement;

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

    this.http.get < any[] > (`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers
      })
      .subscribe(
        (results) => {
          this.searchResults = results;
        },
        (error) => {
          console.error('Error searching users:', error);
        }
      );
  }


  // Select a user from search results
  selectUser(user: User) {
    if (!this.selectedUsers.some(u => u.id === user.id)) {
      this.selectedUsers.push(user); // Add user to selectedUsers
    }
    this.searchResults = []; // Clear search results
  }

  // Remove a selected user by ID
  removeUser(userId: number) {
    this.selectedUsers = this.selectedUsers.filter(user => user.id !== userId);
  }

  // Set the event for editing
  editEvent(event: Event) {
    this.editingEvent = {
      ...event
    }; // Clone the event to avoid direct mutation
    // Populate the selectedUsers array based on userIds
    this.selectedUsers = event.userIds.map(id => ({
      id: Number(id),
      username: `User ${id}`
    })); // You should map it with actual user data
  }

  // Update the existing event
  updateEvent() {
    if (!this.editingEvent) {
      console.error('No event selected for editing');
      return;
    }

    const headers = this.getHeaders();
    if (!this.editingEvent.title || !this.editingEvent.date || this.selectedUsers.length === 0) {
      console.warn('Event title, date, and assigned users are required');
      return; // Validate that title, date, and selected users are provided
    }

    // Update the userIds with selected users
    this.editingEvent.userIds = this.selectedUsers.map(user => user.id.toString());

    this.http.put(`/api/events/${this.editingEvent.id}`, this.editingEvent, {
      headers
    }).subscribe(
      () => {
        this.getEvents(); // Refresh the events list after update
        this.editingEvent = null; // Clear the editing form
        this.selectedUsers = []; // Clear selected users
      },
      (error) => {
        console.error('Error updating event:', error);
      }
    );
  }

  // Delete an event by its ID
  deleteEvent(id: number) {
    const headers = this.getHeaders();

    this.http.delete(`/api/events/${id}`, {
      headers
    }).subscribe(
      () => {
        this.events = this.events.filter(event => event.id !== id); // Remove deleted event from list
      },
      (error) => {
        console.error('Error deleting event:', error);
      }
    );
  }

  // Cancel the edit operation
  cancelEdit() {
    this.editingEvent = null; // Reset the editing form
    this.selectedUsers = []; // Clear selected users
  }
}
