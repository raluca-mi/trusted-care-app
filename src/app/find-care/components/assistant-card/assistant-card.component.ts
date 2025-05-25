import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserInterface } from '../../../auth/models/user.model';

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
  isFavorite: WritableSignal<boolean> = signal(false);

  constructor() {}

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.isFavorite.set(!this.isFavorite());
    console.log(
      'Favorite toggled for:',
      this.assistant().displayName,
      'New state:',
      this.isFavorite()
    );
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
    console.log('View profile clicked for:', this.assistant().displayName);
  }
}
