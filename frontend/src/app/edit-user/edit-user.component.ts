import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';  // Dodaj HttpClientModule
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // Dodaj CommonModule
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { CalendarWidgetComponent } from '../calendar-widget/calendar-widget.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, HeaderComponent, RouterModule, CalendarWidgetComponent],  // Dodaj HttpClientModule tutaj
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editUserForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  userId: number | null = null;
  username: string | null = 'Admin';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      dob: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserDetails(this.userId);
  }

  loadUserDetails(id: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.get(`/api/users/by/${id}`, { headers }).subscribe(
      (user: any) => {
        this.editUserForm.patchValue(user);
      },
      (error) => {
        this.errorMessage = 'Error loading user details';
        console.error('Error:', error);
      }
    );
  }

  onSubmit() {
    if (this.editUserForm.invalid) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.http.put(`/api/users/${this.userId}`, this.editUserForm.value, { headers }).subscribe(
      (response) => {
        this.successMessage = 'User updated successfully!';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/users']), 1500);
      },
      (error) => {
        this.errorMessage = 'Error updating user';
        this.isLoading = false;
        console.error('Error:', error);
      }
    );
  }
}
