import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AssistanceType } from '../../../auth/enums/assistance-type.enum';
import { UserType } from '../../../auth/enums/user-type.enum';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ConnectionRequestStatus } from '../../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequest } from '../../../connection-requests/models/connection-request.model';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { RequestsFacade } from '../../../store/requests/requests.facade';
import { LiveStats } from '../../models/live-stats.model';
import { StatisticsService } from '../../services/statistics.service';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PieController,
  BarController,
  LineController,
  PointElement,
  LineElement
);

@Component({
  selector: 'home-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDivider,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);
  private requestsFacade = inject(RequestsFacade);
  private logger = inject(LoggerService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);

  readonly currentUser: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;
  liveStats: Signal<LiveStats | null | undefined>;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Hourly Rate (RON)',
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Average Hourly Rate by Assistance Type' },
    },
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Average Rate',
        backgroundColor: 'rgba(63, 81, 181, 0.8)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
    ],
  };
  public barChartType: ChartType = 'bar';

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: {
        display: true,
        text: 'Distribution of Verified Assistants by Category',
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#1976d2',
          '#43a047',
          '#ffb300',
          '#e53935',
          '#8e24aa',
          '#00acc1',
        ],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';

  private allSentRequests$: Observable<ConnectionRequest[]>;
  assistanceTypeFilterControl = new FormControl<AssistanceType | 'all'>('all');
  readonly assistanceTypeOptions = Object.values(AssistanceType);
  filteredSentRequests: Signal<ConnectionRequest[]>;

  // Weekly Activity
  public weeklyActivityLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Requests Sent' },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'My Weekly Request Activity' },
    },
  };
  public weeklyActivityLineChartData: Signal<ChartConfiguration['data']>;
  public weeklyActivityLineChartType: ChartType = 'line';

  // Status Distribution
  public statusPieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'My Request Status Distribution' },
    },
  };
  public statusPieChartData: Signal<
    ChartData<'pie', number[], string | string[]>
  >;
  public statusPieChartType: ChartType = 'pie';
  private assistantProfiles: Signal<UserInterface[]>;

  // Assistant Personal Stats
  public assistantWeeklyRequestsLineChartOptions: ChartConfiguration['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Requests Received' },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'My Weekly Received Requests' },
      },
    };
  public assistantWeeklyRequestsLineChartType: ChartType = 'line';
  public assistantWeeklyRequestsLineChartData: Signal<
    ChartConfiguration['data']
  >;

  public assistantStatusPieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'My Request Status Distribution' },
    },
  };
  public assistantStatusPieChartType: ChartType = 'pie';
  public assistantStatusPieChartData: Signal<
    ChartData<'pie', number[], string | string[]>
  >;

  assistantReceivedRequests: Signal<ConnectionRequest[]>;

  // Admin Stats
  public adminLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'New Users' },
      },
      x: { title: { display: true, text: 'Date' } },
    },
    plugins: { legend: { display: true, position: 'bottom' } },
  };
  public adminPieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Verification Status of All Assistants' },
    },
  };
  public adminBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: 'Number of Assistants' },
      },
    },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Verified vs. Unverified per Category' },
    },
  };

  public assistantSignupsChartData: Signal<ChartConfiguration['data']>;
  public researcherSignupsChartData: Signal<ChartConfiguration['data']>;
  public verificationPieChartData: Signal<
    ChartData<'pie', number[], string | string[]>
  >;
  public categoryBreakdownBarChartData: Signal<ChartConfiguration['data']>;

  constructor() {
    this.liveStats = toSignal(this.statisticsService.getLiveStats());
    const currentUserSignal = toSignal(
      toObservable(this.currentUser).pipe(startWith(this.currentUser()))
    );
    const filterSignal = toSignal(
      this.assistanceTypeFilterControl.valueChanges.pipe(
        startWith(this.assistanceTypeFilterControl.value)
      )
    );

    this.allSentRequests$ = this.requestsFacade.allRequests$;

    effect(() => {
      const user = this.currentUser();
      if (user && user.userType === UserType.Researcher) {
        this.requestsFacade.loadSentRequests(user.uid);
      } else if (user && user.userType === UserType.CareAssistant) {
        this.requestsFacade.loadReceivedRequests(user.uid);
      }
    });

    const allSentRequestsSignal = toSignal(this.allSentRequests$, {
      initialValue: [],
    });

    this.assistantProfiles = toSignal(
      this.allSentRequests$.pipe(
        map((requests) =>
          Array.from(new Set(requests.map((r) => r.assistantUid)))
        ),
        switchMap((uids) => this.userProfileService.getUserProfilesByIds(uids))
      ),
      { initialValue: [] }
    );

    this.filteredSentRequests = computed(() => {
      const requests = allSentRequestsSignal();
      const filterType = filterSignal();
      const assistants = this.assistantProfiles();
      if (filterType && filterType !== 'all') {
        const assistantTypeMap = new Map(
          assistants.map((a) => [a.uid, a.assistanceType])
        );
        return requests.filter(
          (req) => assistantTypeMap.get(req.assistantUid) === filterType
        );
      }
      return requests;
    });

    effect(() => {
      const stats = this.liveStats();
      if (stats) {
        this.logger.log('Updating charts with new stats data:', stats);

        // Average Hourly Rate by Assistance Type
        if (stats.averageRates) {
          this.barChartData = {
            labels: Object.keys(stats.averageRates),
            datasets: [
              {
                ...this.barChartData.datasets[0],
                data: Object.values(stats.averageRates),
              },
            ],
          };
        } else {
          this.barChartData = {
            labels: [],
            datasets: [
              {
                ...this.barChartData.datasets[0],
                data: [],
              },
            ],
          };
        }

        // Distribution by Category
        if (stats.categoryCounts) {
          this.pieChartData = {
            labels: Object.keys(stats.categoryCounts),
            datasets: [
              {
                ...this.pieChartData.datasets[0],
                data: Object.values(stats.categoryCounts),
              },
            ],
          };
        } else {
          this.pieChartData = {
            labels: [],
            datasets: [
              {
                ...this.pieChartData.datasets[0],
                data: [],
              },
            ],
          };
        }
      }
    });

    //  Personal Stats Chart Data Researcher
    this.weeklyActivityLineChartData = computed(() => {
      const requests = this.filteredSentRequests();
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = [0, 0, 0, 0, 0, 0, 0];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      requests.forEach((req) => {
        const reqDate = (req.createdAt as any).toDate
          ? (req.createdAt as any).toDate()
          : new Date(req.createdAt as any);
        if (reqDate > oneWeekAgo) {
          let dayIndex = reqDate.getDay() - 1;
          if (dayIndex === -1) {
            dayIndex = 6;
          }
          data[dayIndex]++;
        }
      });
      return {
        labels,
        datasets: [
          {
            data,
            label: 'Requests',
            tension: 0.4,
            fill: true,
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.15)',
            pointBackgroundColor: '#1976d2',
            pointBorderColor: '#fff',
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      };
    });

    this.statusPieChartData = computed(() => {
      const requests = this.filteredSentRequests();
      const statusCounts = {
        [ConnectionRequestStatus.Pending]: 0,
        [ConnectionRequestStatus.Accepted]: 0,
        [ConnectionRequestStatus.Declined]: 0,
      };
      requests.forEach((req) => {
        if (req.status in statusCounts) {
          statusCounts[req.status as keyof typeof statusCounts]++;
        }
      });
      return {
        labels: ['Pending', 'Accepted', 'Declined'],
        datasets: [
          {
            data: [
              statusCounts[ConnectionRequestStatus.Pending],
              statusCounts[ConnectionRequestStatus.Accepted],
              statusCounts[ConnectionRequestStatus.Declined],
            ],
            backgroundColor: ['#ffb300', '#43a047', '#e53935'],
            borderColor: ['#fff', '#fff', '#fff'],
            borderWidth: 2,
          },
        ],
      };
    });

    // Assistant Personal Stats
    this.assistantReceivedRequests = toSignal(
      this.requestsFacade.allRequests$.pipe(
        map((requests) => {
          const user = this.currentUser();
          if (user && user.userType === UserType.CareAssistant) {
            return requests.filter((req) => req.assistantUid === user.uid);
          }
          return [];
        })
      ),
      { initialValue: [] }
    );

    this.assistantWeeklyRequestsLineChartData = computed(() => {
      const requests = this.assistantReceivedRequests();
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = [0, 0, 0, 0, 0, 0, 0];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      requests.forEach((req) => {
        const reqDate = (req.createdAt as any).toDate
          ? (req.createdAt as any).toDate()
          : new Date(req.createdAt as any);
        if (reqDate > oneWeekAgo) {
          let dayIndex = reqDate.getDay() - 1;
          if (dayIndex === -1) {
            dayIndex = 6;
          }
          data[dayIndex]++;
        }
      });
      return {
        labels,
        datasets: [
          {
            data,
            label: 'Requests',
            tension: 0.4,
            fill: true,
            borderColor: '#43a047',
            backgroundColor: 'rgba(67, 160, 71, 0.15)',
            pointBackgroundColor: '#43a047',
            pointBorderColor: '#fff',
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      };
    });

    this.assistantStatusPieChartData = computed(() => {
      const requests = this.assistantReceivedRequests();
      const statusCounts = {
        [ConnectionRequestStatus.Pending]: 0,
        [ConnectionRequestStatus.Accepted]: 0,
        [ConnectionRequestStatus.Declined]: 0,
      };
      requests.forEach((req) => {
        if (req.status in statusCounts) {
          statusCounts[req.status as keyof typeof statusCounts]++;
        }
      });
      return {
        labels: ['Pending', 'Accepted', 'Declined'],
        datasets: [
          {
            data: [
              statusCounts[ConnectionRequestStatus.Pending],
              statusCounts[ConnectionRequestStatus.Accepted],
              statusCounts[ConnectionRequestStatus.Declined],
            ],
            backgroundColor: ['#ffb300', '#43a047', '#e53935'],
            borderColor: ['#fff', '#fff', '#fff'],
            borderWidth: 2,
          },
        ],
      };
    });

    // Admin Chart Data
    this.assistantSignupsChartData = computed(() => {
      const signups = this.liveStats()?.assistantSignupsLast30Days || {};
      const labels = Object.keys(signups).sort();
      const data = labels.map((label) => signups[label]);
      return {
        labels,
        datasets: [
          {
            data,
            label: 'New Assistants',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(63, 81, 181, 0.2)',
            borderColor: '#3f51b5',
          },
        ],
      };
    });

    this.researcherSignupsChartData = computed(() => {
      const signups = this.liveStats()?.researcherSignupsLast30Days || {};
      const labels = Object.keys(signups).sort();
      const data = labels.map((label) => signups[label]);
      return {
        labels,
        datasets: [
          {
            data,
            label: 'New Researchers',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(255, 64, 129, 0.2)',
            borderColor: '#ff4081',
          },
        ],
      };
    });

    this.verificationPieChartData = computed(() => {
      const counts = this.liveStats()?.verificationStatusCounts || {
        verified: 0,
        unverified: 0,
      };
      return {
        labels: ['Verified', 'Unverified'],
        datasets: [
          {
            data: [counts['verified'], counts['unverified']],
            backgroundColor: ['#43a047', '#ffb300'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 2,
          },
        ],
      };
    });

    this.categoryBreakdownBarChartData = computed(() => {
      const breakdown = this.liveStats()?.categoryVerificationBreakdown || {};
      const labels = Object.keys(breakdown);
      const verifiedData = labels.map((label) => breakdown[label]['verified']);
      const unverifiedData = labels.map(
        (label) => breakdown[label]['unverified']
      );
      return {
        labels,
        datasets: [
          {
            data: verifiedData,
            label: 'Verified',
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
          },
          {
            data: unverifiedData,
            label: 'Unverified',
            backgroundColor: 'rgba(255, 152, 0, 0.7)',
          },
        ],
      };
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      this.logger.error('Error during logout:', error);
    }
  }
}
