import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLivreurComponent } from './dashboard';

describe('DashboardLivreurComponent', () => {
  let component: DashboardLivreurComponent;
  let fixture: ComponentFixture<DashboardLivreurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLivreurComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLivreurComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
