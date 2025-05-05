import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../components/custom-snackbar/custom-snackbar.component';
import { NotificationType, SnackbarData } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private matSnackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 6000,
    verticalPosition: 'bottom',
    horizontalPosition: 'center',
  };

  show(message: string, type: NotificationType = 'info'): void {
    const panelClassMap = {
      success: 'success-snackbar',
      error: 'error-snackbar',
      warning: 'warning-snackbar',
      info: 'info-snackbar',
    };

    this.matSnackBar.openFromComponent(CustomSnackbarComponent, {
      ...this.defaultConfig,
      data: {
        message: message,
        type: type,
      } as SnackbarData,
      panelClass: [panelClassMap[type]],
    });
  }

  showSuccess(message: string): void {
    this.show(message, 'success');
  }

  showError(message: string): void {
    this.show(message, 'error');
  }

  showWarning(message: string): void {
    this.show(message, 'warning');
  }

  showInfo(message: string): void {
    this.show(message, 'info');
  }
}
