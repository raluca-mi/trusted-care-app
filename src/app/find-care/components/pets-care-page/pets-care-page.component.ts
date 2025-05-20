import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'pets-care-page',
  imports: [CommonModule, MatCardModule, MatButtonModule],

  templateUrl: './pets-care-page.component.html',
  styleUrl: './pets-care-page.component.scss',
})
export class PetsCarePageComponent {
  readonly pageTitle = 'Pets Care';
  readonly heroImageUrl = 'assets/icons/hero-pets-care.jpg';
  readonly heroDescription =
    'Discover reliable pet sitters, dog walkers, and grooming services for your furry friends.';
}
