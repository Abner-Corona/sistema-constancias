import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstanciasComponent } from './constancias';

describe('ConstanciasComponent', () => {
  let component: ConstanciasComponent;
  let fixture: ComponentFixture<ConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstanciasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
