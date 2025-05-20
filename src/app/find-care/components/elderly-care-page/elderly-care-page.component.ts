import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'elderly-care-page',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './elderly-care-page.component.html',
  styleUrl: './elderly-care-page.component.scss',
})
export class ElderlyCarePageComponent {
  readonly pageTitle = 'Elderly Care';
  readonly heroImageUrl = 'assets/icons/hero-elderly-care.png';
  readonly heroDescription =
    'Browse caregivers specializing in senior care, including companionship and in-home assistance.';
}
