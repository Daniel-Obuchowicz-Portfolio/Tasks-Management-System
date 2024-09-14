import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';  // Ensure HttpClientModule is imported
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor directives
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,  // Standalone component
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, HeaderComponent, RouterModule],  // Ensure HttpClientModule is provided here
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
})
export class AddUserComponent {
  addUserForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  username: string | null = 'Admin';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.addUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],  // Add dob (Date of Birth)
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    // Pobierz token z localStorage
    const token = localStorage.getItem('token');
    
    // Sprawdź, czy token istnieje
    if (!token) {
      this.errorMessage = 'No token found, please log in';
      console.error(this.errorMessage);
      return;
    }
    
    // Sprawdź, czy formularz jest ważny
    if (this.addUserForm.valid) {
      this.isLoading = true;  // Ustaw stan ładowania
  
      const formData = this.addUserForm.value;
  
      // Ustaw nagłówki z tokenem
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`  // Dodaj token w formacie Bearer
      });
  
      // Wyślij żądanie POST do serwera z danymi użytkownika
      this.http.post('/api/users/create', formData, { headers }).subscribe(
        (response) => {
          // Sukces - użytkownik dodany
          this.successMessage = 'User added successfully!';
          this.isLoading = false;
          this.addUserForm.reset();  // Zresetuj formularz po sukcesie
        },
        (error) => {
          // Błąd - pokaż komunikat o błędzie
          this.errorMessage = 'Failed to add user. Please try again.';
          this.isLoading = false;
          console.error('Error adding user:', error);
        }
      );
    } else {
      this.errorMessage = 'Form is invalid. Please check the fields.';
      console.error(this.errorMessage);
    }
  }
  
  
}
