import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
} from '@angular/fire/firestore';
import { catchError, Observable, of, tap } from 'rxjs';
import { LoggerService } from '../../shared/services/logger.service';
import { LiveStats } from '../models/live-stats.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private firestore: Firestore = inject(Firestore);
  private logger = inject(LoggerService);

  getLiveStats(): Observable<LiveStats | null> {
    const statsDocRef = doc(
      this.firestore,
      'statistics',
      'live_stats'
    ) as DocumentReference<LiveStats>;

    return docData<LiveStats>(statsDocRef).pipe(
      tap((stats) => {
        if (stats) {
          this.logger.log(
            'StatisticsService: Live stats data received.',
            stats
          );
        } else {
          this.logger.warn(
            'StatisticsService: statistics/live_stats document does not exist.'
          );
        }
      }),
      catchError((error) => {
        this.logger.error(
          'StatisticsService: Error fetching live stats.',
          error
        );
        return of(null);
      })
    );
  }
}
