import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { RouterOutlet } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserInterface } from './auth/models/user.model';
import { AuthService } from './auth/services/auth.service';
import { UserProfileService } from './shared/services/firestore/user-profile.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  userProfileService = inject(UserProfileService);

  private rootUserSubscription: Subscription | null = null;

  ngOnInit() {
    this.rootUserSubscription = this.authService.user$
      .pipe(
        switchMap((firebaseUser: User | null) => {
          if (firebaseUser) {
            return this.userProfileService
              .getUserProfileById(firebaseUser.uid)
              .pipe(
                catchError((_) => {
                  return of(null);
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((userProfile: UserInterface | null) => {
        if (userProfile) {
          this.authService.currentUser.set(userProfile);
        } else {
          this.authService.currentUser.set(null);
        }
      });
  }

  ngOnDestroy() {
    if (this.rootUserSubscription) {
      this.rootUserSubscription.unsubscribe();
    }
  }
}
