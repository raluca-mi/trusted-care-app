import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
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
  selector: 'researchers-page',
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
  templateUrl: './researchers-page.component.html',
  styleUrl: './researchers-page.component.scss',
})
export class ResearchersPageComponent {
  private userProfileService = inject(UserProfileService);
  private notificationService = inject(NotificationService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  isLoading = signal(true);
  isDeleting = signal(null);

  displayedColumns: string[] = ['displayName', 'email', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<UserInterface> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngOnInit(): void {
    this.loadResearchers();
  }

  loadResearchers(): void {
    this.isLoading.set(true);
    this.userProfileService.getResearchers().subscribe({
      next: (researchers) => {
        this.dataSource.data = researchers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Failed to load researcher data.');
        this.isLoading.set(false);
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

  deleteResearcher(researcher: UserInterface): void {
    const confirmation = window.confirm(
      `Are you sure you want to permanently delete the user '${researcher.displayName}'? This will remove their authentication record, profile data, and any stored files. This action cannot be undone.`
    );

    if (confirmation) {
      this.isDeleting.set(researcher.uid);
      this.adminService.deleteUser(researcher.uid).subscribe({
        next: (result) => {
          this.notificationService.showSuccess(
            `User '${researcher.displayName}' has been deleted.`
          );
          this.dataSource.data = this.dataSource.data.filter(
            (u) => u.uid !== researcher.uid
          );
          this.isDeleting.set(null);
        },
        error: (error) => {
          this.notificationService.showError(
            error.message || 'An unknown error occurred during user deletion.'
          );
          this.isDeleting.set(null);
        },
      });
    }
  }
}
