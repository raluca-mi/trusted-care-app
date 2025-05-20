import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'child-care-page',
  imports: [CommonModule, MatCardModule, MatButtonModule],

  templateUrl: './child-care-page.component.html',
  styleUrl: './child-care-page.component.scss',
})
export class ChildCarePageComponent {
  readonly pageTitle = 'Child Care';
  readonly heroImageUrl = 'assets/icons/hero-child-care.jpg';
  readonly heroDescription =
    'Find trusted nannies, babysitters, and daycare options for your children of all ages.';
}
