import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorCertificadosComponent } from './editor-certificados';

describe('EditorCertificadosComponent - save button loading', () => {
  let component: EditorCertificadosComponent;
  let fixture: ComponentFixture<EditorCertificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorCertificadosComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EditorCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('save button should be enabled when not loading and disabled while loading', async () => {
    const findSaveButton = () =>
      fixture.nativeElement.querySelector(
        'button[aria-label="Guardar configuración del certificado"]'
      );

    // initial state should not be loading (default input), save button enabled
    component.loading.set(false);
    fixture.detectChanges();
    let btn: HTMLButtonElement | null = findSaveButton();
    expect(btn).toBeTruthy();
    expect(btn?.disabled).toBeFalse();

    // when loading flag is set, button becomes disabled
    component.loading.set(true);
    fixture.detectChanges();
    btn = findSaveButton();
    expect(btn).toBeTruthy();
    expect(btn?.disabled).toBeTrue();
  });
});
