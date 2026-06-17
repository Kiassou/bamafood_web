import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueComponent } from './revenue';

describe('RevenueComponent', () => {
  let component: RevenueComponent;
  let fixture: ComponentFixture<RevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
