import { Injectable } from '@angular/core';
import { currentPosition } from '../constants/location.constants';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  currentPosition: {coords: { latitude: number; longitude: number }} | null =
    currentPosition;
  constructor() {}

  reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('No address found');
        }
      });
    });
  }

  getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: this.currentPosition.coords.latitude,
              lng: this.currentPosition.coords.longitude,
            });
          },
          (error) => reject(error)
        );
      }
    });
  }
}
