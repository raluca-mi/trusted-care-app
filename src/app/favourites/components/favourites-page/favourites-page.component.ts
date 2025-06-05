import { CommonModule } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { UserInterface } from '../../../auth/models/user.model';
import { AssistantCardComponent } from '../../../find-care/components/assistant-card/assistant-card.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { FavouritesFacade } from '../../../store/favourites/favourites.facade';

@Component({
  selector: 'favourites-page',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AssistantCardComponent,
  ],
  templateUrl: './favourites-page.component.html',
  styleUrl: './favourites-page.component.scss',
})
export class FavouritesPageComponent {
  private favouritesFacade = inject(FavouritesFacade);
  private notificationService = inject(NotificationService);

  readonly favouriteAssistants: Signal<UserInterface[]> = toSignal(
    this.favouritesFacade.allFavourites$,
    { initialValue: [] }
  );

  constructor() {}

  clearAllFavourites(): void {
    this.favouritesFacade.removeAllFavourites();
    this.notificationService.showInfo('All favourites have been cleared.');
  }
}
