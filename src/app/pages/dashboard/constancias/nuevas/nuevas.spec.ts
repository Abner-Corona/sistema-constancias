import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevasComponent } from './nuevas';

describe('NuevasComponent', () => {
  let component: NuevasComponent;
  let fixture: ComponentFixture<NuevasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
