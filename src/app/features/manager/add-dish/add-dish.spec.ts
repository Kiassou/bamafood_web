import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDishComponent } from './add-dish';

describe('AddDishComponent', () => {
  let component: AddDishComponent;
  let fixture: ComponentFixture<AddDishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDishComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDishComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
