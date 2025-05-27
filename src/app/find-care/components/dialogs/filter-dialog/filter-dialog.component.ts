import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Gender } from "../../../../auth/enums/gender.enum";
import { AvailabilityOption } from "../../../../auth/enums/availability-option.enum";

export interface FilterDialogData {
  currentFilters: Partial<AppliedFilters>;
}
export interface AppliedFilters {
  availability?: AvailabilityOption[];
  experienceYearsMin?: number | null;
  hourlyRateMin?: number | null;
  hourlyRateMax?: number | null;
  gender?: Gender | null;
  nonSmoker?: boolean | null;
  hasOwnTransportation?: boolean | null;
}

@Component({
  selector: 'filter-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatSliderModule,
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss',
})
export class FilterDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<FilterDialogComponent>);
  public data: FilterDialogData | null = inject(MAT_DIALOG_DATA, {
    optional: true,
  });

  filterForm!: FormGroup;

  readonly availabilityOptions = Object.values(AvailabilityOption);
  readonly genderOptions = Object.values(Gender);
  readonly experienceOptions: { value: number | null; viewValue: string }[] = [
    { value: null, viewValue: 'Any Experience' },
    { value: 0, viewValue: '0+ years' },
    { value: 1, viewValue: '1+ years' },
    { value: 3, viewValue: '3+ years' },
    { value: 5, viewValue: '5+ years' },
    { value: 10, viewValue: '10+ years' },
  ];

  readonly rateSliderMin = 0;
  readonly rateSliderMax = 200;
  readonly rateSliderStep = 5;

  constructor() {}

  ngOnInit(): void {
    const current = this.data?.currentFilters || {};

    this.filterForm = this.fb.group({
      availability: [current.availability || []],
      experienceYearsMin: [
        current.experienceYearsMin === undefined
          ? null
          : current.experienceYearsMin,
      ],
      hourlyRateMin: [
        current.hourlyRateMin === undefined
          ? this.rateSliderMin
          : current.hourlyRateMin,
      ],
      hourlyRateMax: [
        current.hourlyRateMax === undefined
          ? this.rateSliderMax
          : current.hourlyRateMax,
      ],
      gender: [current.gender || null],
      nonSmoker: [current.nonSmoker || false],
      hasOwnTransportation: [current.hasOwnTransportation || false],
    });
  }

  onApplyFilters(): void {
    if (this.filterForm.valid) {
      const formValue = this.filterForm.value;
      const appliedFilters: AppliedFilters = {
        availability:
          formValue.availability?.length > 0
            ? formValue.availability
            : undefined,
        experienceYearsMin: formValue.experienceYearsMin,
        hourlyRateMin: formValue.hourlyRateMin,
        hourlyRateMax: formValue.hourlyRateMax,
        gender: formValue.gender,
        nonSmoker: formValue.nonSmoker ? true : undefined,
        hasOwnTransportation: formValue.hasOwnTransportation ? true : undefined,
      };

      Object.keys(appliedFilters).forEach((keyStr) => {
        const key = keyStr as keyof AppliedFilters;
        if (
          appliedFilters[key] === undefined ||
          appliedFilters[key] === null ||
          (Array.isArray(appliedFilters[key]) &&
            (appliedFilters[key] as any[]).length === 0)
        ) {
          delete appliedFilters[key];
        }
      });
      this.dialogRef.close(appliedFilters);
    }
  }

  onClearFilters(): void {
    this.filterForm.reset({
      availability: [],
      experienceYearsMin: null,
      hourlyRateMin: this.rateSliderMin,
      hourlyRateMax: this.rateSliderMax,
      gender: null,
      nonSmoker: false,
      hasOwnTransportation: false,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  formatRateLabel(value: number): string {
    if (value >= this.rateSliderMax) {
      return `${value}/hr`;
    }
    return `${value}/hr`;
  }
}
