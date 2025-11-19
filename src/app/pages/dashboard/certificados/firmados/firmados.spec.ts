import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmadosComponent } from './firmados';

describe('FirmadosComponent', () => {
  let component: FirmadosComponent;
  let fixture: ComponentFixture<FirmadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmadosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FirmadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
