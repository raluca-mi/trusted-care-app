import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { LOGIN_TEXT } from '../../constants/login.constants';
import { REGISTER_TEXT } from '../../constants/register.constants';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';

@Component({
  selector: 'login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  hidePassword = true;

  text = LOGIN_TEXT;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private matDialog: MatDialog,
    private notificationService: NotificationService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(REGISTER_TEXT.emailRegexPattern),
        ],
      ],
      password: ['', [Validators.required]],
    });

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (params['registered'] === 'true') {
        this.notificationService.showSuccess(
          this.text.registrationSuccessToast
        );
        this.router.navigate([], {});
      }
    });
  }

  openForgotPasswordDialog(): void {
    const dialogRef = this.matDialog.open(ForgotPasswordDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logger.log('Password reset email sent to:', result.email);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      await this.authService.login(email, password);
      await this.router.navigate(['/home']);
    } catch (error) {
      this.errorMessage = this.authService.getFirebaseAuthErrorMessage(error);
      this.logger.error('Login failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
