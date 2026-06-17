import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPinComponent } from './verify-pin';

describe('VerifyPinComponent', () => {
  let component: VerifyPinComponent;
  let fixture: ComponentFixture<VerifyPinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyPinComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyPinComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
