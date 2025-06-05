import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantProfilePageComponent } from './assistant-profile-page.component';

describe('AssistantProfilePageComponent', () => {
  let component: AssistantProfilePageComponent;
  let fixture: ComponentFixture<AssistantProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantProfilePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
