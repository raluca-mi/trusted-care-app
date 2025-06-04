import { CommonModule } from '@angular/common';
import { Component, effect, inject, model, NgZone } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SearchPlaceResult } from '../../models/search-place-result.model';
import { LocationService } from '../../services/location.service';
import { MapDisplayComponent } from '../map-display/map-display.component';
import { SearchPlaceComponent } from '../search-place/search-place.component';

@Component({
  selector: 'location-picker',
  imports: [
    SearchPlaceComponent,
    MapDisplayComponent,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
})
export class LocationPickerComponent {
  selectedPlace = model<SearchPlaceResult | undefined>();

  locationService = inject(LocationService);
  ngZone = inject(NgZone);

  constructor() {}

  async pickCurrentLocation() {
    try {
      const { lat, lng } = await this.locationService.getCurrentPosition();
      const coords = new google.maps.LatLng(lat, lng);
      let address = 'Current Location';
      try {
        address = await this.locationService.reverseGeocode(lat, lng);
      } catch (e) {
        console.warn('Could not get address from coordinates', e);
      }

      this.selectedPlace.set({
        address: address,
        formattedAddress: address,
        coordinates: coords,
      } as SearchPlaceResult);
    } catch (error) {
      console.warn('Geolocation not available or permission denied.', error);
    }
  }
}
