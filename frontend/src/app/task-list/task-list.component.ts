import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, FormsModule, HttpClientModule, CalendarWidgetComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  username: string | null = 'Admin';
  isDeleteModalOpen = false;
  taskToDelete: number | null = null;
  tasks: any[] = [];
  filteredTasks: any[] = [];
  paginatedTasks: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalTasks = 0;
  itemsPerPage = 6;
  paginationArray: number[] = [];
  searchTerm = '';
  selectedStatus = 'all';
  selectedPriority = 'all';
  sortBy = 'dueDate';
  taskStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    highPriority: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please log in');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>('/api/tasks?page=1&limit=1000', { headers }).subscribe(
      (response) => {
        this.tasks = Array.isArray(response.tasks) ? response.tasks : [];
        this.totalTasks = this.tasks.length;
        this.taskStats.total = this.tasks.length;
        this.taskStats.completed = this.tasks.filter((task) => task.status === 'completed').length;
        this.taskStats.inProgress = this.tasks.filter((task) => task.status === 'in-progress').length;
        this.taskStats.highPriority = this.tasks.filter((task) => task.priority === 'high').length;
        this.applyFilters();
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  applyFilters() {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredTasks = this.tasks
      .filter((task) => {
        const matchesSearch = !normalizedSearch
          || task.title?.toLowerCase().includes(normalizedSearch)
          || task.description?.toLowerCase().includes(normalizedSearch);
        const matchesStatus = this.selectedStatus === 'all' || task.status === this.selectedStatus;
        const matchesPriority = this.selectedPriority === 'all' || task.priority === this.selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((taskA, taskB) => {
        if (this.sortBy === 'priority') {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[taskA.priority] ?? 99) - (priorityOrder[taskB.priority] ?? 99);
        }

        if (this.sortBy === 'status') {
          return taskA.status.localeCompare(taskB.status);
        }

        return new Date(taskA.dueDate).getTime() - new Date(taskB.dueDate).getTime();
      });

    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.filteredTasks.length / this.itemsPerPage));
    this.createPaginationArray();
    this.paginateTasks();
  }

  createPaginationArray() {
    this.paginationArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  paginateTasks() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateTasks();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateTasks();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.paginateTasks();
  }

  lastPage() {
    this.currentPage = this.totalPages;
    this.paginateTasks();
  }

  deleteTask(id: number) {
    this.isDeleteModalOpen = true;
    this.taskToDelete = id;
  }

  confirmDelete() {
    if (!this.taskToDelete) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(`/api/tasks/${this.taskToDelete}`, { headers }).subscribe(
      () => {
        this.isDeleteModalOpen = false;
        this.taskToDelete = null;
        this.fetchTasks();
      },
      (error) => {
        console.error('Error deleting task', error);
      }
    );
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.taskToDelete = null;
  }
}
