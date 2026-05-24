import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterModule } from '@angular/router';
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
    displayEventTime: true,
    eventClick: this.viewEvent.bind(this)
  };

  username: string | null = 'Admin';
  isDeleteModalOpen = false;
  isViewModalOpen = false;
  isEditModalOpen = false;
  eventToEditOrView: any = null;
  eventIdToDelete: number | null = null;
  assignedUsers: any[] = [];
  selectedItemType: 'event' | 'task' | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private getAuthHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private fetchTaskById(taskId: number, callback: (taskData: any) => void) {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return;
    }

    this.http.get<any>(`/api/tasks/${taskId}`, { headers }).subscribe(
      (data) => callback(data),
      (error) => {
        console.error('Error fetching task details:', error);
      }
    );
  }

  loadEvents() {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return;
    }

    Promise.all([
      this.http.get<any[]>('/api/events', { headers }).toPromise(),
      this.http.get<any>('/api/tasks?page=1&limit=1000', { headers }).toPromise()
    ])
      .then(([eventsData, tasksResponse]) => {
        const events = Array.isArray(eventsData)
          ? eventsData.map((event: any) => ({
              title: event.title,
              start: event.date,
              description: event.description,
              extendedProps: {
                id: event.id,
                itemType: 'event',
                userIds: event.userIds
              }
            }))
          : [];

        const tasks = Array.isArray(tasksResponse?.tasks)
          ? tasksResponse.tasks.map((task: any) => ({
              title: task.title,
              start: task.dueDate,
              description: task.description,
              extendedProps: {
                id: task.id,
                itemType: 'task'
              }
            }))
          : [];

        this.calendarOptions.events = [...events, ...tasks];
      })
      .catch((error) => {
        console.error('Error fetching calendar items:', error);
      });
  }

  fetchEventById(eventId: number, callback: (eventData: any) => void) {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return;
    }

    this.http.get<any>(`/api/events/by/${eventId}`, { headers }).subscribe(
      (data) => {
        callback(data);
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  fetchAssignedUsers(userIds: string) {
    if (!userIds || userIds === 'null') {
      this.assignedUsers = [];
      return;
    }

    const userIdsArray = userIds.split(',').map((id) => id.trim());
    const headers = this.getAuthHeaders();
    if (!headers) {
      return;
    }

    this.http.post<any[]>('/api/users/byIds', { userIds: userIdsArray }, { headers }).subscribe(
      (users) => {
        this.assignedUsers = users;
      },
      (error) => {
        console.error('Error fetching assigned users:', error);
      }
    );
  }

  viewEvent(arg: any) {
    const { id, itemType } = arg.event.extendedProps;
    this.selectedItemType = itemType ?? 'event';

    if (this.selectedItemType === 'task') {
      this.fetchTaskById(id, (taskData) => {
        const assignedUserIds = typeof taskData.assignedUserIds === 'string'
          ? taskData.assignedUserIds.split(',')
          : [];

        this.eventToEditOrView = {
          ...taskData,
          date: taskData.dueDate
        };
        this.assignedUsers = (taskData.assignedUsernames || []).map((username: string, index: number) => ({
          username,
          id: assignedUserIds[index] ?? ''
        }));
      });
      return;
    }

    this.fetchEventById(id, (eventData) => {
      this.eventToEditOrView = eventData;
      this.fetchAssignedUsers(eventData.userIds);
    });
  }

  editEvent() {
    if (this.selectedItemType === 'task' || !this.eventToEditOrView?.id) {
      return;
    }

    this.fetchEventById(this.eventToEditOrView.id, (eventData) => {
      this.eventToEditOrView = eventData;
      this.isEditModalOpen = true;
      this.isViewModalOpen = false;
    });
  }

  openDeleteModal() {
    if (this.selectedItemType === 'task') {
      return;
    }

    this.eventIdToDelete = this.eventToEditOrView.id;
    this.isDeleteModalOpen = true;
    this.isViewModalOpen = false;
  }

  confirmDelete() {
    if (this.eventIdToDelete === null) {
      return;
    }

    const headers = this.getAuthHeaders();
    if (!headers) {
      return;
    }

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
