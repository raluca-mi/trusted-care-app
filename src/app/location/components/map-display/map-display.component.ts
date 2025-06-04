import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { SearchPlaceResult } from '../../models/search-place-result.model';
import { LocationService } from '../../services/location.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'map-display',
  imports: [CommonModule, GoogleMapsModule, MatProgressSpinner],
  templateUrl: './map-display.component.html',
  styleUrl: './map-display.component.scss',
})
export class MapDisplayComponent {
  @ViewChild('map', { static: true })
  map!: GoogleMap;

  private locationService = inject(LocationService);

  place = input<SearchPlaceResult | undefined>();
  zoom = 5;
  markerPosition: google.maps.LatLng | undefined;

  isLoading: boolean = true;

  constructor() {
    effect(() => {
      if (this.place()) {
        this.markPlaceOnMap();
      } else {
        this.viewCurrentLocationOnMap();
      }
    });
  }

  markPlaceOnMap() {
    const coordinates = this.place()?.coordinates;
    if (coordinates) {
      this.goToLocation(coordinates);
    }
  }

  viewCurrentLocationOnMap() {
    this.locationService
      .getCurrentPosition()
      .then(({ lat, lng }) => {
        const coordinates = new google.maps.LatLng(lat, lng);
        this.goToLocation(coordinates, false);
      })
      .catch((error) => {
        console.warn('Geolocation not available or permission denied.', error);
      });
  }

  goToLocation(coordinates: google.maps.LatLng, withMarker = true) {
    if (withMarker) {
      this.markerPosition = coordinates;
    }
    setTimeout(() => {
      this.map.panTo(coordinates);
    }, 1000);
    this.isLoading = false;

    this.zoom = 17;
  }
}
