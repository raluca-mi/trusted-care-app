import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildCarePageComponent } from './child-care-page.component';

describe('ChildCarePageComponent', () => {
  let component: ChildCarePageComponent;
  let fixture: ComponentFixture<ChildCarePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildCarePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChildCarePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
