import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryManagerComponent } from './delivery';

describe('DeliveryManagerComponent', () => {
  let component: DeliveryManagerComponent;
  let fixture: ComponentFixture<DeliveryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
