import { CommonModule } from '@angular/common';
import { Component, inject, input, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UserInterface } from '../../../auth/models/user.model';
import { FavouritesFacade } from '../../../store/favourites/favourites.facade';

@Component({
  selector: 'assistant-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './assistant-card.component.html',
  styleUrl: './assistant-card.component.scss',
})
export class AssistantCardComponent {
  assistant: Signal<UserInterface> = input.required<UserInterface>();
  private favouritesFacade = inject(FavouritesFacade);

  isFavourite: Signal<boolean | undefined>;

  constructor() {
    const assistant$: Observable<UserInterface> = toObservable(this.assistant);

    this.isFavourite = toSignal(
      assistant$.pipe(
        switchMap((assistant) => {
          if (assistant && assistant.uid) {
            return this.favouritesFacade.isFavourite$(assistant.uid);
          }

          return of(undefined);
        }),
        distinctUntilChanged()
      ),
      { initialValue: undefined }
    );
  }

  toggleFavourite(event: MouseEvent): void {
    event.stopPropagation();
    const currentAssistant = this.assistant();
    if (!currentAssistant) return;

    const currentIsFavourite = this.isFavourite();

    if (currentIsFavourite === true) {
      this.favouritesFacade.removeFavourite(currentAssistant.uid);
    } else {
      this.favouritesFacade.addFavourite(currentAssistant);
    }
  }

  get availabilitySnippet(): string {
    const currentAssistant = this.assistant();
    if (
      currentAssistant.availability &&
      currentAssistant.availability.length > 0
    ) {
      return (
        currentAssistant.availability.slice(0, 2).join(', ') +
        (currentAssistant.availability.length > 2 ? ', ...' : '')
      );
    }
    return 'Availability not specified';
  }

  viewProfile(): void {
    const currentAssistant = this.assistant();
    console.log('View profile clicked for:', currentAssistant.displayName);
  }
}
