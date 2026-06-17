import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishesManagerComponent } from './dishes';

describe('DishesManagerComponent', () => {
  let component: DishesManagerComponent;
  let fixture: ComponentFixture<DishesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishesManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DishesManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
