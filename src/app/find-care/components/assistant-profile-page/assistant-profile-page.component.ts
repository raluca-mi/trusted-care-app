import { CommonModule } from '@angular/common';
import { Component, effect, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { UserInterface } from '../../../auth/models/user.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { FavouritesFacade } from '../../../store/favourites/favourites.facade';

@Component({
  selector: 'assistant-profile-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './assistant-profile-page.component.html',
  styleUrl: './assistant-profile-page.component.scss',
})
export class AssistantProfilePageComponent {
  private route = inject(ActivatedRoute);
  private userProfileService = inject(UserProfileService);
  private logger = inject(LoggerService);
  private favouritesFacade = inject(FavouritesFacade);

  private notificationService = inject(NotificationService);

  assistant: Signal<UserInterface | null | undefined>;
  isLoading: Signal<boolean | undefined>;
  isFavourite: Signal<boolean | undefined>;

  constructor() {
    effect(() => {
      if (this.assistant() === null && this.isLoading() === false) {
      }
    });

    this.fetchAssistantByUidParam();
    this.setInitialFavouriteState();
  }

  toggleFavorite(): void {
    const currentAssistant = this.assistant();
    if (!currentAssistant) {
      this.logger.warn('ToggleFavorite: No assistant data available.');
      return;
    }

    const currentIsFavorite = this.isFavourite();
    if (currentIsFavorite === true) {
      this.favouritesFacade.removeFavourite(currentAssistant.uid);
      this.notificationService.showInfo(
        `${currentAssistant.displayName} removed from favourites.`
      );
    } else {
      this.favouritesFacade.addFavourite(currentAssistant);
      this.notificationService.showSuccess(
        `${currentAssistant.displayName} added to favourites!`
      );
    }
  }

  calculateAge(dateOfBirthString?: string | null): number | null {
    if (!dateOfBirthString) return null;
    try {
      const birthDate = new Date(dateOfBirthString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      this.logger.error('Error calculating age:', e);
      return null;
    }
  }

  private fetchAssistantByUidParam() {
    const assistant$: Observable<UserInterface | null> =
      this.route.paramMap.pipe(
        switchMap((params) => {
          const assistantId = params.get('uid');
          if (assistantId) {
            return this.userProfileService.getUserProfileById(assistantId).pipe(
              catchError((err) => {
                this.logger.error(
                  `AssistantProfilePage: Error fetching profile for UID ${assistantId}:`,
                  err
                );
                this.notificationService.showError(
                  'Could not load assistant profile.'
                );
                return of(null);
              })
            );
          }
          this.logger.warn(
            'AssistantProfilePage: No UID found in route params.'
          );
          this.notificationService.showError('Assistant ID not provided.');
          return of(null);
        })
      );

    this.assistant = toSignal(assistant$, { initialValue: undefined });

    this.isLoading = toSignal(
      this.route.paramMap.pipe(
        map(() => true),
        switchMap(() =>
          assistant$.pipe(
            map(() => false),
            catchError(() => of(false))
          )
        )
      ),
      { initialValue: true }
    );
  }

  private setInitialFavouriteState() {
    const isFavourite$: Observable<boolean> = toObservable(this.assistant).pipe(
      switchMap((currentAssistant) => {
        if (currentAssistant && currentAssistant.uid) {
          return this.favouritesFacade.isFavourite$(currentAssistant.uid);
        }
        return of(false);
      })
    );
    this.isFavourite = toSignal(isFavourite$, { initialValue: false });
  }
}
