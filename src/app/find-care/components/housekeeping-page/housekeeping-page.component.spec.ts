import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HousekeepingPageComponent } from './housekeeping-page.component';

describe('HousekeepingPageComponent', () => {
  let component: HousekeepingPageComponent;
  let fixture: ComponentFixture<HousekeepingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HousekeepingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HousekeepingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
