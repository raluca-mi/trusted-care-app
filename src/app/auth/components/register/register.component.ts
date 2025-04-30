import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'register',
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['', Validators.required]
    });
  }


  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const { email, password, userType, /* displayName */ } = this.registerForm.value;

      // Assuming 'displayName' might be added to the form later
      // const displayName = this.registerForm.value.displayName;

      await this.authService.registerWithEmailPassword(email, password, userType, /* displayName */);


      alert('Registration successful! Please log in.');
      await this.router.navigate(['/login']);

    } catch (error) {
      console.error("Registration failed:", error);
      this.errorMessage = this.authService.getFirebaseAuthErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get userType() { return this.registerForm.get('userType'); }
}


