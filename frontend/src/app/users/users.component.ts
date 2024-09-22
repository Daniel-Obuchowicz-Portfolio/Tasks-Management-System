import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';  
import { CommonModule } from '@angular/common';  // Import CommonModule for ngClass, ngFor, ngIf
import { RouterModule } from '@angular/router';  // Import RouterModule for routerLink
import { HeaderComponent } from '../header/header.component';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, HeaderComponent, CalendarWidgetComponent],  // Add RouterModule and CommonModule
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  paginatedUsers: any[] = [];
  errorMessage: string | null = null;
  username: string | null = 'Admin'; 
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  isDeleteModalOpen: boolean = false;  // Flaga do zarządzania stanem modala
  userToDelete: any = null;  // Trzyma dane użytkownika do usunięcia
  paginationArray: number[] = []; // Tablica do trzymania numerów stron

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // Funkcja otwierająca modal
  openDeleteModal(user: any) {
    this.isDeleteModalOpen = true;
    this.userToDelete = user;
  }

  // Funkcja zamykająca modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  // Funkcja do usuwania użytkownika
  confirmDeleteUser() {
    if (this.userToDelete) {
      this.deleteUser(this.userToDelete.id);
      this.closeDeleteModal();
    }
  }

  // Tworzenie tablicy z numerami stron
  createPaginationArray() {
    this.paginationArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please log in');
      return;
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.get<any>('/api/users', { headers }).subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.users = response;
          this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
          this.createPaginationArray(); // Tworzenie paginacji po otrzymaniu danych
          this.paginateUsers();
        } else {
          console.error('Unexpected response format:', response);
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
        if (error.status === 403) {
          console.error('403 Forbidden: You do not have permission to access this resource.');
        }
      }
    );
  }

  paginateUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateUsers();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.paginateUsers();
  }

  lastPage() {
    this.currentPage = this.totalPages;
    this.paginateUsers();
  }

  deleteUser(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`/api/users/${id}`, { headers }).subscribe(
      () => {
        console.log('User deleted successfully');
        this.fetchUsers();  // Refresh the user list after deletion
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }
}
