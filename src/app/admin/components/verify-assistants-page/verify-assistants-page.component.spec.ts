import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAssistantsPageComponent } from './verify-assistants-page.component';

describe('VerifyAssistantsPageComponent', () => {
  let component: VerifyAssistantsPageComponent;
  let fixture: ComponentFixture<VerifyAssistantsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyAssistantsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyAssistantsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
