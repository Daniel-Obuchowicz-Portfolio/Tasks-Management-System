import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, CommonModule, RouterModule], // Ensure necessary imports
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  registrationError: string | null = null;  // Holds any registration error messages
  registrationSuccess: string | null = null; // Holds success message for registration

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the form with validation rules
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });
  }

  // Validator to ensure passwords match
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Get validation errors dynamically
  getError(controlName: string): string | null {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required.`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${controlName} must be at least ${minLength} characters long.`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (control?.hasError('pattern')) {
      return 'Password must contain at least 8 characters, including a number, an uppercase and lowercase letter, and a special character.';
    }
    return null;
  }

  // Handle the registration form submission
  onRegister() {
    this.registrationError = null;  // Reset error message on each submit
    this.registrationSuccess = null; // Reset success message

    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      // Send the registration request
      this.http.post('/api/auth/register', formData).subscribe(
        (response) => {
          this.registrationSuccess = 'Registration successful!';  // Set success message
          console.log('Registration successful', response);
          this.registerForm.reset({
            firstName: '',
            lastName: '',
            email: '',
            dob: '',
            username: '',
            password: '',
            confirmPassword: ''
          }, { emitEvent: false });
        },
        (error) => {
          console.error('Registration failed', error);
          this.registrationError = error?.error?.message || 'Registration failed. Please try again.';  // Get error from response
        }
      );
    } else {
      this.registrationError = 'Form is invalid. Please check your input.';
      console.error('Form is invalid');
      this.registerForm.markAllAsTouched();  // Mark all controls as touched to show validation errors
    }
  }
}
