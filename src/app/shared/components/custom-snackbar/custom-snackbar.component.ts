import { CommonModule } from '@angular/common';
import { Component, computed, Inject, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { SnackbarData } from '../../models/notification.model';

@Component({
  selector: 'custom-snackbar',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.scss',
})
export class CustomSnackbarComponent {
  readonly snackBarRef = inject(MatSnackBarRef<CustomSnackbarComponent>);

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData) {}

  iconName: Signal<string> = computed(() => {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  });

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
