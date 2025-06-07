import { CommonModule } from '@angular/common';
import { Component, effect, inject, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { UserType } from '../../../auth/enums/user-type.enum';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ADMIN_NAVIGATION_LINK_DETAILS } from '../../../shared/constants/admin-navigation-link-details.constants';
import { ASSISTANCE_PAGES_CONFIG } from '../../../shared/constants/assistance-type-details.constants';
import { NavigationAssistanceTypeDetail } from '../../../shared/models/navigation-assistance-type-detail.model';
import { NavigationLinkDetails } from '../../../shared/models/navigation-link-details.model';
import { LoggerService } from '../../../shared/services/logger.service';
import { FavouritesFacade } from '../../../store/favourites/favourites.facade';
import { RequestsFacade } from '../../../store/requests/requests.facade';

@Component({
  selector: 'main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinner,
    MatBadgeModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private favouritesFacade = inject(FavouritesFacade);
  private requestsFacade = inject(RequestsFacade);

  currentUser: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly assistanceTypes: NavigationAssistanceTypeDetail[] =
    ASSISTANCE_PAGES_CONFIG;
  readonly adminNavigetionLinkDetails: NavigationLinkDetails[] =
    ADMIN_NAVIGATION_LINK_DETAILS;

  isFindCareExpanded = false;

  readonly totalFavourites: Signal<number | undefined> = toSignal(
    this.favouritesFacade.totalFavourites$
  );

  constructor() {
    effect(() => {
      if (this.currentUser()) {
        this.favouritesFacade.loadFavourites(this.currentUser().uid);
        if (this.currentUser().userType === UserType.Researcher) {
          this.requestsFacade.loadSentRequests(this.currentUser().uid);
        } else if (this.currentUser().userType === UserType.CareAssistant) {
          this.requestsFacade.loadReceivedRequests(this.currentUser().uid);
        }
      }
    });
  }

  async logout(): Promise<void> {
    this.favouritesFacade.clearFavouritesState();
    this.requestsFacade.clearRequestsState();
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      this.logger.error('Logout failed in MainLayout:', error);
    }
  }

  navigateTo(route: string): void {
    if (this.sidenav && this.sidenav.mode === 'over' && this.sidenav.opened) {
      this.sidenav.close();
    }
    this.router.navigate([route]);
  }
}
