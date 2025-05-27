import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  Subscription,
  tap,
} from 'rxjs';
import {
  UserInterface,
} from '../../../auth/models/user.model';
import { Gender } from "../../../auth/enums/gender.enum";
import { AssistanceType } from "../../../auth/enums/assistance-type.enum";
import { NavigationAssistanceTypeDetail } from '../../../shared/models/navigation-assistance-type-detail.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { SortKey } from '../../enums/sort-key.enum';
import { AssistantCardComponent } from '../assistant-card/assistant-card.component';
import {
  AppliedFilters,
  FilterDialogComponent,
  FilterDialogData,
} from '../dialogs/filter-dialog/filter-dialog.component';

@Component({
  selector: 'assistance-type-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AssistantCardComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './assistance-type-page.component.html',
  styleUrl: './assistance-type-page.component.scss',
})
export class AssistanceTypePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  private logger = inject(LoggerService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  pageConfig: Signal<NavigationAssistanceTypeDetail | null | undefined>;
  assistants: WritableSignal<UserInterface[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorLoading: WritableSignal<string | null> = signal(null);

  searchForm: FormGroup;
  currentAppliedFilters: WritableSignal<Partial<AppliedFilters>> = signal({});
  hasActiveFilters = computed(() => this.computeHasActiveFilters());

  private allFetchedAssistants: UserInterface[] = [];
  private loadAssistantsSubscription?: Subscription;
  private searchSubscription?: Subscription;

  currentSortKey: SortKey | null = null;
  public readonly SortKey = SortKey;

  constructor() {
    this.pageConfig = toSignal(
      this.route.data.pipe(
        tap((rawData) =>
          this.logger.log(
            'AssistanceTypePageComponent: Raw route data received:',
            rawData
          )
        ),
        map((data) => this.extractPageConfig(data)),
        catchError((err) => {
          this.logger.error(
            'AssistanceTypePageComponent: Error in route data observable pipe:',
            err
          );
          return of(null);
        })
      ),
      { initialValue: undefined }
    );

    this.searchForm = this.fb.group({
      searchTerm: [''],
    });

    effect(() => {
      const config = this.pageConfig();
      if (config) {
        this.fetchInitialAssistants(config.displayName);
      } else if (config === null) {
        this.handleMissingConfig();
      }
    });
  }

  ngOnInit(): void {
    if (this.pageConfig() === null) {
      this.logger.warn('Page config was null on init, redirecting to home.');
      this.router.navigate(['/home']);
    }
    this.subscribeToSearch();
  }

  private extractPageConfig(data: any): NavigationAssistanceTypeDetail | null {
    const config = data['assistancePageData'] as NavigationAssistanceTypeDetail;
    if (!config || !config.displayName) {
      this.logger.error(
        'AssistanceTypePageComponent: Config data missing or invalid.',
        { receivedData: data }
      );
      return null;
    }
    return config;
  }

  fetchInitialAssistants(assistanceType: AssistanceType): void {
    this.logger.log(`Fetching initial assistants for type: ${assistanceType}`);
    this.isLoading.set(true);
    this.errorLoading.set(null);
    this.assistants.set([]);
    this.allFetchedAssistants = [];
    this.loadAssistantsSubscription?.unsubscribe();
    this.loadAssistantsSubscription = this.userProfileService
      .getCareAssistantsByAssistanceType(assistanceType)
      .pipe(
        catchError((err) => this.handleFetchError(err, assistanceType)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => this.handleAssistantsFetched(data),
      });
  }

  private handleMissingConfig(): void {
    this.logger.error(
      '[AssistancePage] Page config is null. Cannot load assistants.'
    );
    this.errorLoading.set('Error: Page configuration is missing or invalid.');
    this.isLoading.set(false);
  }

  private subscribeToSearch(): void {
    this.searchSubscription = this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((term) => {
        this.applyAllFilters(term || '', this.currentAppliedFilters());
      });
  }

  private handleFetchError(err: any, assistanceType: AssistanceType) {
    this.logger.error(
      `Error loading initial assistants for ${assistanceType}:`,
      err
    );
    this.errorLoading.set('Failed to load caregivers. Please try again later.');
    return of([]);
  }

  private handleAssistantsFetched(data: UserInterface[]): void {
    this.allFetchedAssistants = data;
    this.applyAllFilters(
      this.searchForm.get('searchTerm')?.value || '',
      this.currentAppliedFilters()
    );
  }

  applyAllFilters(
    searchTerm: string = '',
    filters: Partial<AppliedFilters> = {}
  ): void {
    this.logger.log(
      `Applying ALL client-side filters. Search: "${searchTerm}", Filters:`,
      filters
    );
    let processedData = [...this.allFetchedAssistants];
    if (searchTerm)
      processedData = this.filterBySearchTerm(processedData, searchTerm);
    if (filters.availability && filters.availability.length > 0)
      processedData = this.filterByAvailability(
        processedData,
        filters.availability
      );
    if (
      filters.experienceYearsMin !== undefined &&
      filters.experienceYearsMin !== null
    )
      processedData = this.filterByExperience(
        processedData,
        filters.experienceYearsMin!
      );
    if (
      filters.hourlyRateMin !== undefined &&
      filters.hourlyRateMax !== undefined &&
      filters.hourlyRateMin !== null &&
      filters.hourlyRateMax !== null
    )
      processedData = this.filterByHourlyRate(
        processedData,
        filters.hourlyRateMin!,
        filters.hourlyRateMax!
      );
    if (filters.gender && filters.gender !== Gender.Other)
      processedData = this.filterByGender(processedData, filters.gender);
    if (filters.nonSmoker === true)
      processedData = this.filterByNonSmoker(processedData);
    if (filters.hasOwnTransportation === true)
      processedData = this.filterByTransportation(processedData);
    if (this.currentSortKey)
      processedData = this.sortList(processedData, this.currentSortKey);
    this.assistants.set(processedData);
  }

  private filterBySearchTerm(
    data: UserInterface[],
    term: string
  ): UserInterface[] {
    const lowerSearchTerm = term.toLowerCase();
    return data.filter(
      (assistant) =>
        assistant.displayName?.toLowerCase().includes(lowerSearchTerm) ||
        assistant.location?.toLowerCase().includes(lowerSearchTerm) ||
        assistant.bio?.toLowerCase().includes(lowerSearchTerm) ||
        assistant.assistanceTypes?.some((at) =>
          at.toLowerCase().includes(lowerSearchTerm)
        )
    );
  }

  private filterByAvailability(
    data: UserInterface[],
    availability: any[]
  ): UserInterface[] {
    return data.filter((assistant) =>
      availability.some((favail) => assistant.availability?.includes(favail))
    );
  }

  private filterByExperience(
    data: UserInterface[],
    minYears: number
  ): UserInterface[] {
    return data.filter((a) => (a.experienceYears ?? -1) >= minYears);
  }

  private filterByHourlyRate(
    data: UserInterface[],
    min: number,
    max: number
  ): UserInterface[] {
    return data.filter((assistant) => {
      const rate = assistant.hourlyRate;
      if (rate === null || rate === undefined) return false;
      return rate >= min && rate <= max;
    });
  }

  private filterByGender(
    data: UserInterface[],
    gender: Gender
  ): UserInterface[] {
    return data.filter((assistant) => assistant.gender === gender);
  }

  private filterByNonSmoker(data: UserInterface[]): UserInterface[] {
    return data.filter(
      (assistant) => assistant.additionalDetails?.nonSmoker === true
    );
  }

  private filterByTransportation(data: UserInterface[]): UserInterface[] {
    return data.filter(
      (assistant) => assistant.additionalDetails?.hasOwnTransportation === true
    );
  }

  sortAssistants(sortKey: SortKey): void {
    this.currentSortKey = sortKey;
    const sorted = this.sortList([...this.assistants()], sortKey);
    this.assistants.set(sorted);
  }

  sortList(assistants: UserInterface[], sortKey: SortKey): UserInterface[] {
    switch (sortKey) {
      case SortKey.RateAsc:
        return assistants.sort(
          (a, b) => (a.hourlyRate ?? Infinity) - (b.hourlyRate ?? Infinity)
        );
      case SortKey.RateDesc:
        return assistants.sort(
          (a, b) => (b.hourlyRate ?? -Infinity) - (a.hourlyRate ?? -Infinity)
        );
      case SortKey.ExpAsc:
        return assistants.sort(
          (a, b) => (a.experienceYears ?? 0) - (b.experienceYears ?? 0)
        );
      case SortKey.ExpDesc:
        return assistants.sort(
          (a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0)
        );
      default:
        return assistants;
    }
  }

  onSearchSubmit(): void {
    this.applyAllFilters(
      this.searchForm.get('searchTerm')?.value || '',
      this.currentAppliedFilters()
    );
  }

  openFilterDialog(): void {
    const config = this.pageConfig();
    if (!config) return;
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '500px',
      data: {
        currentFilters: this.currentAppliedFilters(),
      } as FilterDialogData,
    });
    dialogRef
      .afterClosed()
      .subscribe((result: AppliedFilters | undefined | null) => {
        const currentSearchTerm =
          this.searchForm.get('searchTerm')?.value || '';
        if (result !== undefined && result !== null) {
          this.currentAppliedFilters.set(result);
          this.applyAllFilters(currentSearchTerm, result);
        }
      });
  }

  private computeHasActiveFilters(): boolean {
    const filters = this.currentAppliedFilters();
    if (!filters || Object.keys(filters).length === 0) return false;
    const keys = Object.keys(filters);
    if (
      keys.length === 2 &&
      'hourlyRateMin' in filters &&
      'hourlyRateMax' in filters &&
      filters.hourlyRateMin === 0 &&
      filters.hourlyRateMax === 200
    ) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.loadAssistantsSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }
}
