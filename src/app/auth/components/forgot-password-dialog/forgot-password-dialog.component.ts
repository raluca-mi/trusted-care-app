import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoggerService } from '../../../shared/services/logger.service';
import { FORGOT_PASSWORD_TEXT } from '../../constants/forgot-password.constants';
import { LOGIN_TEXT } from '../../constants/login.constants';
import { REGISTER_TEXT } from '../../constants/register.constants';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'forgot-password-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss'],
})
export class ForgotPasswordDialogComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  loginText = LOGIN_TEXT;
  text = FORGOT_PASSWORD_TEXT;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ForgotPasswordDialogComponent>);
  private logger = inject(LoggerService);

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(REGISTER_TEXT.emailRegexPattern),
        ],
      ],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;
    const email = this.forgotPasswordForm.value.email;

    try {
      await this.authService.sendPasswordResetEmail(email);
      this.successMessage = this.text.successMessage;
      this.forgotPasswordForm.disable();
    } catch (error) {
      this.logger.error('Password reset failed:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'auth/user-not-found'
      ) {
        this.errorMessage =
          'No account found associated with this email address.';
      } else {
        this.errorMessage = this.authService.getFirebaseAuthErrorMessage(error);
        this.logger.error('Error sending password reset email:', error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
