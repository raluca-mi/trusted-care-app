import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'housekeeping-page',
  imports: [CommonModule, MatCardModule, MatButtonModule],

  templateUrl: './housekeeping-page.component.html',
  styleUrl: './housekeeping-page.component.scss',
})
export class HousekeepingPageComponent {
  readonly pageTitle = 'Housekeeping';
  readonly heroImageUrl = 'assets/icons/hero-housekeeping.jpg';
  readonly heroDescription =
    'Find professional housekeeping services to keep your home clean and organized.';
}
