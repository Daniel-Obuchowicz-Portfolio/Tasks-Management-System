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
    eventClick: this.handleEventClick.bind(this)
  };

  username: string | null = 'Admin';
  isEventActionModalOpen = false;
  isDeleteModalOpen = false;
  isViewModalOpen = false;
  isEditModalOpen = false;
  eventToEditOrView: any = null;
  eventIdToDelete: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

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
              id: event.id
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

  // Handle event click to open the Event Action Modal
  handleEventClick(arg: any) {
    this.eventToEditOrView = arg.event.extendedProps;  // Store the clicked event ID
    this.isEventActionModalOpen = true;  // Open the event action modal
  }

  // Open View Modal (fetch event details first)
  viewEvent() {
    if (this.eventToEditOrView?.id) {
      this.fetchEventById(this.eventToEditOrView.id, (eventData) => {
        this.eventToEditOrView = eventData;  // Store full event details
        this.isViewModalOpen = true;  // Open the view modal
        this.isEventActionModalOpen = false;  // Close the event action modal
      });
    }
  }

  // Open Edit Modal (fetch event details first)
  editEvent() {
    if (this.eventToEditOrView?.id) {
      this.fetchEventById(this.eventToEditOrView.id, (eventData) => {
        this.eventToEditOrView = eventData;  // Store full event details
        this.isEditModalOpen = true;  // Open the edit modal
        this.isEventActionModalOpen = false;  // Close the event action modal
      });
    }
  }

  openDeleteModal() {
    this.eventIdToDelete = this.eventToEditOrView.id;
    this.isEventActionModalOpen = false;
    this.isDeleteModalOpen = true;
  }

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

  closeEventActionModal() {
    this.isEventActionModalOpen = false;
    this.eventToEditOrView = null;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.eventIdToDelete = null;
  }

  handleEventUpdate(updatedEvent: any) {
    this.loadEvents();
    this.closeEditModal();
  }
}
