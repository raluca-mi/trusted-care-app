import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserAuth } from './auth/models/user-auth.model';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  authService = inject(AuthService);
  private userSubscription: Subscription | null = null;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUser.set(
          {
            uid: user.uid,
            email: user.email
          } as UserAuth
        );
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
