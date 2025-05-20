import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElderlyCarePageComponent } from './elderly-care-page.component';

describe('ElderlyCarePageComponent', () => {
  let component: ElderlyCarePageComponent;
  let fixture: ComponentFixture<ElderlyCarePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElderlyCarePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ElderlyCarePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
