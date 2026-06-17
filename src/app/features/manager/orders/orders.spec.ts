import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersManagerComponent } from './orders';

describe('OrdersManagerComponent', () => {
  let component: OrdersManagerComponent;
  let fixture: ComponentFixture<OrdersManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
