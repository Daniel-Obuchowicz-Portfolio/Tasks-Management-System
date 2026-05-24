import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor
import { RouterModule } from '@angular/router';  // Import RouterModule for routerLink


@Component({
  standalone: true,  // Standalone component
  imports: [HttpClientModule, FormsModule, CommonModule, RouterModule],  // Include CommonModule here
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');

    if (token) {
      void this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    const loginData = { username: this.username, password: this.password };

    this.http.post<{ token: string }>('/api/auth/login', loginData).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', this.username);

        this.isLoading = false;
        void this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      (error) => {
        this.errorMessage = 'Login failed. Please check your username and password.';
        this.isLoading = false;
      }
    );
  }
}
