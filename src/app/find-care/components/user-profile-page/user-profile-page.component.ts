import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { UserType } from '../../../auth/enums/user-type.enum';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ConnectionRequestStatus } from '../../../connection-requests/enums/connection-request-status.enum';
import { MapDisplayComponent } from '../../../location/components/map-display/map-display.component';
import { SearchPlaceResult } from '../../../location/models/search-place-result.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { FavouritesFacade } from '../../../store/favourites/favourites.facade';
import { RequestsFacade } from '../../../store/requests/requests.facade';

@Component({
  selector: 'user-profile-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MapDisplayComponent,
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.scss',
})
export class UserProfilePageComponent {
  private route = inject(ActivatedRoute);
  private userProfileService = inject(UserProfileService);
  private logger = inject(LoggerService);
  private favouritesFacade = inject(FavouritesFacade);
  private requestsFacade = inject(RequestsFacade);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  user: Signal<UserInterface | null | undefined>;
  isLoading: Signal<boolean | undefined>;
  isFavourite: Signal<boolean | undefined>;
  existingRequestStatus: Signal<ConnectionRequestStatus | null | undefined>;
  declinedRequest: Signal<ConnectionRequestStatus | undefined>;
  canViewContactInfo: Signal<boolean | undefined>;
  userPlace: Signal<SearchPlaceResult | undefined>;

  readonly currentResearcher: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;

  readonly RequestStatus = ConnectionRequestStatus;
  readonly UserType = UserType;

  constructor() {
    this.fetchUserByUidParam();
    this.setInitialFavouriteState();
    this.setExistingRequestStatus();
    this.getDeclinedRequest();

    this.canViewContactInfo = computed(
      () =>
        this.currentResearcher()?.isAdmin === true ||
        this.existingRequestStatus() === ConnectionRequestStatus.Accepted
    );

    this.userPlace = computed(() => {
      const currentUser = this.user();
      if (currentUser?.coordinates && currentUser.location) {
        const coords = new google.maps.LatLng(
          currentUser.coordinates.latitude,
          currentUser.coordinates.longitude
        );
        return { address: currentUser.location, coordinates: coords };
      }
      return undefined;
    });
  }

  toggleFavorite(): void {
    const currentAssistant = this.user();
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

  sendConnectionRequest(): void {
    const assistant = this.user();
    const researcher = this.currentResearcher();

    if (!assistant || !researcher || !researcher.uid || !assistant.uid) {
      this.notificationService.showError(
        'Cannot send request. User or assistant data missing.'
      );
      this.logger.error(
        'SendConnectionRequest: Missing researcher or assistant UID.',
        { researcher, assistant }
      );
      return;
    }

    if (
      this.existingRequestStatus() === ConnectionRequestStatus.Pending ||
      this.existingRequestStatus() === ConnectionRequestStatus.Accepted
    ) {
      this.notificationService.showInfo(
        'A connection request is already pending or has been accepted.'
      );
      return;
    }

    this.logger.log(
      `Sending connection request from ${researcher.uid} to ${assistant.uid}`
    );
    this.requestsFacade.sendRequest(researcher.uid, assistant.uid);
    this.notificationService.showInfo(
      `Request sent to ${assistant.displayName}.`
    );
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

  private fetchUserByUidParam() {
    const user$: Observable<UserInterface | null> = this.route.paramMap.pipe(
      switchMap((params) => {
        const userId = params.get('uid');
        if (userId) {
          return this.userProfileService.getUserProfileById(userId).pipe(
            catchError((err) => {
              this.logger.error(
                `UserProfilePage Error fetching profile for UID ${userId}:`,
                err
              );
              this.notificationService.showError(
                'Could not load user profile.'
              );
              return of(null);
            })
          );
        }
        this.logger.warn('UserProfilePage No UID found in route params.');
        this.notificationService.showError('User ID not provided.');
        return of(null);
      })
    );

    this.user = toSignal(user$, { initialValue: undefined });

    this.isLoading = toSignal(
      this.route.paramMap.pipe(
        map(() => true),
        switchMap(() =>
          user$.pipe(
            map(() => false),
            catchError(() => of(false))
          )
        )
      ),
      { initialValue: true }
    );
  }

  private setInitialFavouriteState() {
    const isFavourite$: Observable<boolean> = toObservable(this.user).pipe(
      switchMap((currentUser) => {
        if (currentUser && currentUser.uid) {
          return this.favouritesFacade.isFavourite$(currentUser.uid);
        }
        return of(false);
      })
    );
    this.isFavourite = toSignal(isFavourite$, { initialValue: false });
  }

  private setExistingRequestStatus() {
    const viewProfileUserSignal$ = toObservable(this.user);
    const currentUserSignal$ = toObservable(this.currentResearcher);

    const existingRequestStatus$: Observable<ConnectionRequestStatus | null> =
      combineLatest([viewProfileUserSignal$, currentUserSignal$]).pipe(
        switchMap(([profileUser, currentUser]) => {
          if (
            profileUser &&
            profileUser.uid &&
            currentUser &&
            currentUser.uid
          ) {
            let assistantUid: string;
            let researcherUid: string;

            if (currentUser.userType === UserType.CareAssistant) {
              assistantUid = currentUser.uid;
              researcherUid = profileUser.uid;
            } else {
              assistantUid = profileUser.uid;
              researcherUid = currentUser.uid;
            }

            return this.requestsFacade
              .getActiveRequestBetweenUsers$(researcherUid, assistantUid)
              .pipe(map((request) => (request ? request.status : null)));
          }
          return of(null);
        }),
        distinctUntilChanged()
      );
    this.existingRequestStatus = toSignal(existingRequestStatus$, {
      initialValue: undefined,
    });
  }

  private getDeclinedRequest() {
    const assistantSignal$ = toObservable(this.user);
    const researcherSignal$ = toObservable(this.currentResearcher);

    const existingDeclinedRequest$: Observable<ConnectionRequestStatus | null> =
      combineLatest([assistantSignal$, researcherSignal$]).pipe(
        switchMap(([currentAssistant, researcher]) => {
          if (
            researcher &&
            researcher.uid &&
            currentAssistant &&
            currentAssistant.uid
          ) {
            return this.requestsFacade
              .getDeclinedRequestBetweenUsers$(
                researcher.uid,
                currentAssistant.uid
              )
              .pipe(map((request) => (request ? request.status : null)));
          }
          return of(null);
        }),
        distinctUntilChanged()
      );
    this.declinedRequest = toSignal(existingDeclinedRequest$, {
      initialValue: undefined,
    });
  }
}
