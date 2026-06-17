import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesManagerComponent } from './activities';

describe('ActivitiesManagerComponent', () => {
  let component: ActivitiesManagerComponent;
  let fixture: ComponentFixture<ActivitiesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
