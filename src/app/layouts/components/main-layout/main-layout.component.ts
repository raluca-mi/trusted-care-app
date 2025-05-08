import { CommonModule } from '@angular/common';
import { Component, inject, Signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { LoggerService } from '../../../shared/services/logger.service';

@Component({
  selector: 'main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);

  currentUser: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
      this.logger.log('Logged out successfully from MainLayout');
    } catch (error) {
      this.logger.error('Logout failed in MainLayout:', error);
    }
  }

  navigateTo(route: string): void {
    this.logger.log(`Navigating to ${route}`);
    this.router.navigate([route]);
  }
}
