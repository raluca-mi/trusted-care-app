import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { SearchPlaceResult } from '../../models/search-place-result.model';

@Component({
  selector: 'select-location-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    LocationPickerComponent,
  ],
  templateUrl: './select-location-dialog.component.html',
  styleUrl: './select-location-dialog.component.scss',
})
export class SelectLocationDialogComponent {
  private dialogRef = inject(MatDialogRef<SelectLocationDialogComponent>);
  selectedPlace = signal<SearchPlaceResult | undefined>(undefined);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { initialPlace?: SearchPlaceResult }
  ) {
    this.selectedPlace.set(data?.initialPlace);
  }

  submit() {
    this.dialogRef.close(this.selectedPlace());
  }

  close() {
    this.dialogRef.close();
  }
}
