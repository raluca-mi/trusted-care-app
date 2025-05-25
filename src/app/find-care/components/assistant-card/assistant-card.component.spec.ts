import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCardComponent } from './assistant-card.component';

describe('AssistantCardComponent', () => {
  let component: AssistantCardComponent;
  let fixture: ComponentFixture<AssistantCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssistantCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
