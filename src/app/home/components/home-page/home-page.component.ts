import { Component, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { LoggerService } from '../../../shared/services/logger.service';

@Component({
  selector: 'home-page',
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private authService = inject(AuthService);
  router = inject(Router);
  private logger = inject(LoggerService);

  currentUser: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      this.logger.error('Error during logout:', error);
    }
  }
}
