import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, Subscription } from 'rxjs';
import {
  AssistanceTypeEnum,
  UserInterface,
} from '../../../auth/models/user.model';
import { NavigationAssistanceTypeDetail } from '../../../shared/models/navigation-assistance-type-detail.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { AssistantCardComponent } from '../assistant-card/assistant-card.component';

@Component({
  selector: 'assistance-type-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AssistantCardComponent,
    MatIconModule,
  ],
  templateUrl: './assistance-type-page.component.html',
  styleUrl: './assistance-type-page.component.scss',
})
export class AssistanceTypePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  pageConfig: Signal<NavigationAssistanceTypeDetail | null | undefined>;

  assistants: WritableSignal<UserInterface[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorLoading: WritableSignal<string | null> = signal(null);

  private loadAssistantsSubscription: Subscription | undefined;

  constructor() {
    this.pageConfig = toSignal(
      this.route.data.pipe(
        map((data) => {
          const config = data[
            'assistancePageData'
          ] as NavigationAssistanceTypeDetail;
          if (!config || !config.displayName) {
            return null;
          }

          return config;
        })
      ),
      { initialValue: undefined }
    );

    effect(() => {
      const config = this.pageConfig();
      if (config) {
        this.loadAssistants(config.displayName);
      } else if (config === null) {
        this.errorLoading.set(
          'Error: Page configuration is missing or invalid.'
        );
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    const initialConfig = this.pageConfig();
    if (initialConfig === null) {
      this.router.navigate(['/home']);
    } else if (initialConfig === undefined) {
    }
  }

  loadAssistants(assistanceType: AssistanceTypeEnum): void {
    this.isLoading.set(true);
    this.errorLoading.set(null);
    this.assistants.set([]);

    this.loadAssistantsSubscription?.unsubscribe();

    this.loadAssistantsSubscription = this.userProfileService
      .getCareAssistantsByAssistanceType(assistanceType)
      .pipe(
        catchError((_) => {
          this.errorLoading.set(
            'Failed to load caregivers. Please try again later.'
          );
          this.isLoading.set(false);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.assistants.set(data);
          this.isLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.loadAssistantsSubscription?.unsubscribe();
  }
}
