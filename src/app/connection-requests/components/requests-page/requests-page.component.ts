import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { UserType } from '../../../auth/enums/user-type.enum';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { RequestsFacade } from '../../../store/requests/requests.facade';
import { ConnectionRequestStatus } from '../../enums/connection-request-status.enum';
import { ConnectionRequest } from '../../models/connection-request.model';

export interface DetailedRequest extends ConnectionRequest {
  otherUser?: UserInterface | null;
}

@Component({
  selector: 'requests-page',
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './requests-page.component.html',
  styleUrl: './requests-page.component.scss',
})
export class RequestsPageComponent {
  private authService = inject(AuthService);
  private requestsFacade = inject(RequestsFacade);
  private userProfileService = inject(UserProfileService);
  private notificationService = inject(NotificationService);

  readonly currentUser: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;
  readonly isLoading: Signal<boolean | undefined>;
  readonly userType = UserType;
  readonly requestStatus = ConnectionRequestStatus;

  readonly pendingRequests: Signal<DetailedRequest[] | undefined>;
  readonly acceptedRequests: Signal<DetailedRequest[] | undefined>;
  readonly declinedRequests: Signal<DetailedRequest[] | undefined>;

  constructor() {
    const isResearcher = computed(
      () => this.currentUser()?.userType === UserType.Researcher
    );

    const requests$: Observable<DetailedRequest[]> = toObservable(
      this.currentUser
    ).pipe(
      switchMap((user) => {
        if (!user) return of([]);

        const baseRequests$ = isResearcher()
          ? this.requestsFacade
              .getSentRequestsByStatus$(
                user.uid,
                ConnectionRequestStatus.Pending
              )
              .pipe(
                switchMap((pending) =>
                  this.requestsFacade
                    .getSentRequestsByStatus$(
                      user.uid,
                      ConnectionRequestStatus.Accepted
                    )
                    .pipe(map((accepted) => [...pending, ...accepted]))
                ),
                switchMap((pendingAndAccepted) =>
                  this.requestsFacade
                    .getSentRequestsByStatus$(
                      user.uid,
                      ConnectionRequestStatus.Declined
                    )
                    .pipe(
                      map((declined) => [...pendingAndAccepted, ...declined])
                    )
                )
              )
          : this.requestsFacade
              .getReceivedRequestsByStatus$(
                user.uid,
                ConnectionRequestStatus.Pending
              )
              .pipe(
                switchMap((pending) =>
                  this.requestsFacade
                    .getReceivedRequestsByStatus$(
                      user.uid,
                      ConnectionRequestStatus.Accepted
                    )
                    .pipe(map((accepted) => [...pending, ...accepted]))
                ),
                switchMap((pendingAndAccepted) =>
                  this.requestsFacade
                    .getReceivedRequestsByStatus$(
                      user.uid,
                      ConnectionRequestStatus.Declined
                    )
                    .pipe(
                      map((declined) => [...pendingAndAccepted, ...declined])
                    )
                )
              );

        return baseRequests$.pipe(
          switchMap((requests) => {
            if (requests.length === 0) return of([]);

            const userDetailsObservables = requests.map((req) => {
              const otherUserId = isResearcher()
                ? req.assistantUid
                : req.researcherUid;
              return this.userProfileService
                .getUserProfileById(otherUserId)
                .pipe(
                  map((otherUser) => ({ ...req, otherUser } as DetailedRequest))
                );
            });
            return combineLatest(userDetailsObservables);
          })
        );
      })
    );

    const allDetailedRequests = toSignal(requests$, { initialValue: [] });

    this.pendingRequests = computed(() =>
      allDetailedRequests().filter(
        (req) => req.status === ConnectionRequestStatus.Pending
      )
    );
    this.acceptedRequests = computed(() =>
      allDetailedRequests().filter(
        (req) => req.status === ConnectionRequestStatus.Accepted
      )
    );
    this.declinedRequests = computed(() =>
      allDetailedRequests().filter(
        (req) => req.status === ConnectionRequestStatus.Declined
      )
    );
    this.isLoading = toSignal(
      isResearcher()
        ? this.requestsFacade.isLoadingSentRequests$
        : this.requestsFacade.isLoadingReceivedRequests$,
      { initialValue: true }
    );
  }

  acceptRequest(requestId: string): void {
    const assistantUid = this.currentUser()?.uid;
    if (!assistantUid) return;
    this.requestsFacade.respondToRequest(
      requestId,
      ConnectionRequestStatus.Accepted,
      assistantUid
    );
  }

  declineRequest(requestId: string): void {
    const assistantUid = this.currentUser()?.uid;
    if (!assistantUid) return;
    this.requestsFacade.respondToRequest(
      requestId,
      ConnectionRequestStatus.Declined,
      assistantUid
    );
  }

  cancelRequest(requestId: string): void {
    const researcherUid = this.currentUser()?.uid;
    if (!researcherUid) return;
    this.requestsFacade.cancelRequest(requestId, researcherUid);
    this.notificationService.showInfo('Request cancelled.');
  }

  toDate(value: Date | Timestamp): Date | null {
    if (!value) return null;
    if (
      typeof value === 'object' &&
      'toDate' in value &&
      typeof value.toDate === 'function'
    ) {
      return value.toDate();
    }
    return value as Date;
  }
}
