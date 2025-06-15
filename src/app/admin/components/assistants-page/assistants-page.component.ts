import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { UserInterface } from '../../../auth/models/user.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'assistants-page',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './assistants-page.component.html',
  styleUrl: './assistants-page.component.scss',
})
export class AssistantsPageComponent implements AfterViewInit {
  private userProfileService = inject(UserProfileService);
  private notificationService = inject(NotificationService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  isLoading = signal(true);
  isDeleting = signal<string | null>(null);

  displayedColumns: string[] = [
    'displayName',
    'email',
    'assistanceType',
    'createdAt',
    'isVerified',
    'actions',
  ];
  dataSource: MatTableDataSource<UserInterface> = new MatTableDataSource();
  pageSize = 5;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor() {}

  ngOnInit(): void {
    this.loadAssistants();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAssistants(): void {
    this.isLoading.set(true);
    this.userProfileService.getAllAssistants().subscribe({
      next: (assistants) => {
        this.dataSource.data = assistants;
        this.isLoading.set(false);

        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
      },
      error: (err) => {
        this.notificationService.showError('Failed to load assistants data.');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewProfile(uid: string): void {
    this.router.navigate(['/user-profile-page', uid]);
  }

  deleteAssistant(assistant: UserInterface): void {
    const confirmation = window.confirm(
      `Are you sure you want to permanently delete the user '${assistant.displayName}'? This will remove their authentication record, profile data, and any stored files. This action cannot be undone.`
    );

    if (confirmation) {
      this.isDeleting.set(assistant.uid);
      this.adminService.deleteUser(assistant.uid).subscribe({
        next: (result) => {
          this.notificationService.showSuccess(
            `User '${assistant.displayName}' has been deleted.`
          );
          this.dataSource.data = this.dataSource.data.filter(
            (u) => u.uid !== assistant.uid
          );

          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          });
          this.isDeleting.set(null);
        },
        error: (error) => {
          this.notificationService.showError(
            error.message || 'An unknown error occurred during user deletion.'
          );
          this.isDeleting.set(null);
          console.error(error);
        },
      });
    }
  }
}
