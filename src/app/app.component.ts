import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserInterface } from './auth/models/user.model';
import { AuthService } from './auth/services/auth.service';
import { UserProfileService } from './shared/services/firestore/user-profile.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  authService = inject(AuthService);
  userProfileService = inject(UserProfileService);
  private userSubscription: Subscription | null = null;

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userProfileService
          .getUserProfileById(user.uid)
          .subscribe((userProfile) => {
            if (userProfile) {
              this.authService.currentUser.set({
                ...userProfile,
              } as UserInterface);
            } else {
              this.authService.currentUser.set(null);
            }
          });
      } else {
        this.authService.currentUser.set(null);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
