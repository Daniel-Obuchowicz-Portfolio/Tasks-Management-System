import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, HttpClientModule, CalendarWidgetComponent],  // Include HttpClientModule here
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  username: string | null = 'Admin';
  isDeleteModalOpen = false;
  taskToDelete: any = null;
  tasks: any[] = []; // Full list of tasks
  paginatedTasks: any[] = []; // Tasks for the current page
  currentPage: number = 1;
  totalPages: number = 1;
  totalTasks: number = 0;
  itemsPerPage: number = 9; // Set number of tasks per page
  paginationArray: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTasks();
  }

  // Fetch tasks from the API
  fetchTasks() {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
      console.error('No token found, please log in');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Attach token to Authorization header
    });

    this.http.get<any>(`/api/tasks?page=${this.currentPage}&limit=${this.itemsPerPage}`, { headers }).subscribe(
      (response) => {
        // Assign tasks and set pagination properties
        this.tasks = response.tasks || response;  // Handle both paginated and non-paginated responses
        this.totalTasks = response.totalTasks || this.tasks.length;
        this.totalPages = Math.ceil(this.totalTasks / this.itemsPerPage);
        this.createPaginationArray();
        this.paginateTasks();
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  // Create array for pagination buttons
  createPaginationArray() {
    this.paginationArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Paginate the tasks based on the current page
  paginateTasks() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTasks = this.tasks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchTasks();
    }
  }

  // Go to the previous page
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchTasks();
    }
  }

  // Jump to a specific page
  goToPage(page: number) {
    this.currentPage = page;
    this.fetchTasks();
  }

  // Handle deleting a task
  deleteTask(id: number) {
    this.isDeleteModalOpen = true;
    this.taskToDelete = id;
  }

  // Confirm task deletion
  confirmDelete(): void {
    if (this.taskToDelete) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http.delete(`/api/tasks/${this.taskToDelete}`, { headers }).subscribe(
        () => {
          this.fetchTasks();  // Reload tasks after deletion
          this.isDeleteModalOpen = false;
        },
        (error) => {
          console.error('Error deleting task', error);
        }
      );
    }
  }

  // Close delete modal
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  // Go to the last page
  lastPage() {
    this.currentPage = this.totalPages;
    this.fetchTasks();
  }

  editTask(taskId: number): void {
    // Navigate to the edit form (if using router)
  }
}
