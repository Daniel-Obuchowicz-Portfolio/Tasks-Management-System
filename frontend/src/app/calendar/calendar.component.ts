import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';  
import { FullCalendarModule } from '@fullcalendar/angular';  
import { CalendarOptions } from '@fullcalendar/core';  
import dayGridPlugin from '@fullcalendar/daygrid';  
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';  
import { EditCalendarComponent } from '../edit-calendar/edit-calendar.component';  
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    HttpClientModule,
    HeaderComponent,
    RouterModule,
    CalendarDetailComponent,
    CalendarWidgetComponent,
    EditCalendarComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventClick: this.viewEvent.bind(this)
  };

  username: string | null = 'Admin';
  isEventActionModalOpen = false;
  isDeleteModalOpen = false;
  isViewModalOpen = false;
  isEditModalOpen = false;
  eventToEditOrView: any = null;
  eventIdToDelete: number | null = null;
  assignedUsers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // Load all events
  loadEvents() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    });

    this.http.get<any[]>('/api/events', { headers }).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.calendarOptions.events = data.map((event: any) => ({
            title: event.title,
            start: event.date,
            description: event.description,
            extendedProps: {
              id: event.id,
              userIds: event.userIds
            }
          }));
        } else {
          console.error('Invalid response structure');
        }
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  // Fetch event details by ID from backend
  fetchEventById(eventId: number, callback: (eventData: any) => void) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    });

    this.http.get<any>(`/api/events/by/${eventId}`, { headers }).subscribe(
      (data) => {
        callback(data);  // Pass event data to the callback (used for modals)
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  // Fetch users assigned to an event
  fetchAssignedUsers(userIds: string) {
    if (!userIds || userIds === 'null') {
      this.assignedUsers = [];
      return;
    }

    const userIdsArray = userIds.split(',').map(id => id.trim());
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.post<any[]>('/api/users/byIds', { userIds: userIdsArray }, { headers }).subscribe(
      (users) => {
        this.assignedUsers = users;
      },
      (error) => {
        console.error('Error fetching assigned users:', error);
      }
    );
  }

  // Handle event click to open the Event Action Modal
  viewEvent(arg: any) {
    this.fetchEventById(arg.event.extendedProps.id, (eventData) => {
      this.eventToEditOrView = eventData;
      this.fetchAssignedUsers(eventData.userIds);  // Fetch assigned users for the event
      // this.isViewModalOpen = true;  // Open the view modal
    });
  }

  // Open Edit Modal (fetch event details first)
  editEvent() {
    if (this.eventToEditOrView?.id) {
      this.fetchEventById(this.eventToEditOrView.id, (eventData) => {
        this.eventToEditOrView = eventData;  // Store full event details
        this.isEditModalOpen = true;  // Open the edit modal
        this.isViewModalOpen = false;  // Close the view modal
      });
    }
  }

  // Open Delete Modal
  openDeleteModal() {
    this.eventIdToDelete = this.eventToEditOrView.id;
    this.isDeleteModalOpen = true;
    this.isViewModalOpen = false;
  }

  // Confirm Deletion of Event
  confirmDelete() {
    if (this.eventIdToDelete !== null) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      });

      this.http.delete(`/api/events/${this.eventIdToDelete}`, { headers }).subscribe(
        () => {
          this.loadEvents();
          this.closeDeleteModal();
        },
        (error) => {
          console.error('Error deleting event:', error);
        }
      );
    }
  }

  // Close View Modal
  closeViewModal() {
    this.isViewModalOpen = false;
  }

  // Close Edit Modal
  closeEditModal() {
    this.isEditModalOpen = false;
  }

  // Close Delete Confirmation Modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.eventIdToDelete = null;
  }

  // Handle event update after editing
  handleEventUpdate(updatedEvent: any) {
    this.loadEvents();  // Reload the events to reflect the updated data
    this.closeEditModal();
  }
}
