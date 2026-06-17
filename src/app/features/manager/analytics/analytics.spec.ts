import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsManagerComponent } from './analytics';

describe('AnalyticsManagerComponent', () => {
  let component: AnalyticsManagerComponent;
  let fixture: ComponentFixture<AnalyticsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
