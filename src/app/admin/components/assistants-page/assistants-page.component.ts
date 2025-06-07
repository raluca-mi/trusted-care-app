import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UserInterface } from '../../../auth/models/user.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'assistants-page',
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
  ],
  templateUrl: './assistants-page.component.html',
  styleUrl: './assistants-page.component.scss',
})
export class AssistantsPageComponent implements OnInit, AfterViewInit {
  private userProfileService = inject(UserProfileService);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isLoading = signal(true);
  isProcessing = signal<string | null>(null);

  displayedColumns: string[] = ['displayName', 'email', 'createdAt', 'actions'];

  pendingDataSource = new MatTableDataSource<UserInterface>();
  verifiedDataSource = new MatTableDataSource<UserInterface>();

  @ViewChild('pendingPaginator') pendingPaginator!: MatPaginator;
  @ViewChild('verifiedPaginator') verifiedPaginator!: MatPaginator;

  @ViewChild('pendingSort') pendingSort!: MatSort;
  @ViewChild('verifiedSort') verifiedSort!: MatSort;

  constructor() {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit() {
    this.pendingDataSource.paginator = this.pendingPaginator;
    this.pendingDataSource.sort = this.pendingSort;
    this.verifiedDataSource.paginator = this.verifiedPaginator;
    this.verifiedDataSource.sort = this.verifiedSort;
  }

  loadAllData(): void {
    this.isLoading.set(true);
    forkJoin({
      pending: this.userProfileService.getPendingVerificationAssistants(),
      verified: this.userProfileService.getVerifiedAssistants(),
    }).subscribe({
      next: ({ pending, verified }) => {
        this.pendingDataSource.data = pending;
        this.verifiedDataSource.data = verified;

        this.isLoading.set(false);
      },
      error: (_) => {
        this.isLoading.set(false);
        this.notificationService.showError(
          'Failed to load all assistant data.'
        );
      },
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<UserInterface>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  viewProfile(uid: string): void {
    this.router.navigate(['/user-profile-page', uid]);
  }

  async verifyAssistant(assistant: UserInterface): Promise<void> {
    if (this.isProcessing()) return;
    this.isProcessing.set(assistant.uid);
    try {
      await firstValueFrom(
        this.userProfileService.updateUserProfile(assistant.uid, {
          isVerified: true,
        })
      );
      this.notificationService.showSuccess(
        `${assistant.displayName} has been verified.`
      );
      this.loadAllData();
    } catch (error) {
      this.notificationService.showError(
        'Verification failed. Please try again.'
      );
    } finally {
      this.isProcessing.set(null);
    }
  }

  async rejectAssistant(assistant: UserInterface): Promise<void> {
    if (this.isProcessing()) return;
    const confirmation = window.confirm(
      `Are you sure you want to REJECT ${assistant.displayName}'s profile? This will mark their profile as rejected, requiring them to resubmit.`
    );
    if (confirmation) {
      this.isProcessing.set(assistant.uid);
      try {
        await firstValueFrom(
          this.userProfileService.updateUserProfile(assistant.uid, {
            isRejected: true,
          })
        );
        this.notificationService.showWarning(
          `${assistant.displayName}'s profile has been rejected.`
        );
        this.loadAllData();
      } catch (error) {
        this.notificationService.showError(
          'Rejection failed. Please try again.'
        );
      } finally {
        this.isProcessing.set(null);
      }
    }
  }

  deleteUser(user: UserInterface): void {
    if (this.isProcessing()) return;
    const confirmation = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE the user '${user.displayName}'? This action cannot be undone.`
    );
    if (confirmation) {
      this.isProcessing.set(user.uid);
      this.adminService.deleteUser(user.uid).subscribe({
        next: (result) => {
          this.notificationService.showSuccess(
            `User '${user.displayName}' has been deleted.`
          );
          this.loadAllData();
        },
        error: (error) => {
          this.notificationService.showError(
            error.message || 'An unknown error occurred during user deletion.'
          );
        },
        complete: () => {
          this.isProcessing.set(null);
        },
      });
    }
  }
}
