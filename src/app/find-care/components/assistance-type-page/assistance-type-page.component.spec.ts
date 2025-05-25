import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistanceTypePageComponent } from './assistance-type-page.component';

describe('AssistanceTypePageComponent', () => {
  let component: AssistanceTypePageComponent;
  let fixture: ComponentFixture<AssistanceTypePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistanceTypePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssistanceTypePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
