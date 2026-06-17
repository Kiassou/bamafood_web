import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommanderComponent } from './commander';

describe('CommanderComponent', () => {
  let component: CommanderComponent;
  let fixture: ComponentFixture<CommanderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommanderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommanderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
