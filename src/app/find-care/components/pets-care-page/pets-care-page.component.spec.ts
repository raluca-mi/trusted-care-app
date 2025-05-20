import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsCarePageComponent } from './pets-care-page.component';

describe('PetsCarePageComponent', () => {
  let component: PetsCarePageComponent;
  let fixture: ComponentFixture<PetsCarePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsCarePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PetsCarePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
