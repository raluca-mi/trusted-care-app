import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  NgZone,
  viewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchPlaceResult } from '../../models/search-place-result.model';

@Component({
  selector: 'search-place',
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './search-place.component.html',
  styleUrl: './search-place.component.scss',
})
export class SearchPlaceComponent {
  inputField = viewChild<ElementRef>('inputField');

  placeholder = input<string>();
  place = model<SearchPlaceResult | undefined>();

  autocomplete: google.maps.places.Autocomplete | undefined;
  private ngZone = inject(NgZone);

  constructor() {
    effect(() => {
      if (this.place() && this.inputField()) {
        this.inputField().nativeElement.value = this.place()?.address ?? '';
      }
    });
  }

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(
      this.inputField().nativeElement
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();

      const result: SearchPlaceResult = {
        address: this.inputField().nativeElement.value,
        formattedAddress: place?.formatted_address,
        coordinates: place?.geometry?.location,
      };

      this.ngZone.run(() => {
        this.place.set(result);
      });
    });
  }
}
