import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsManagerComponent } from './accounts-manager';

describe('AccountsManagerComponent', () => {
  let component: AccountsManagerComponent;
  let fixture: ComponentFixture<AccountsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
