import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchersPageComponent } from './researchers-page.component';

describe('ResearchersPageComponent', () => {
  let component: ResearchersPageComponent;
  let fixture: ComponentFixture<ResearchersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchersPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
