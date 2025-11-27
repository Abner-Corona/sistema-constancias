import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevosComponent } from './nuevos';
import { LotesService } from '@services/api/lotes.service';
import { BaseConstanciaService } from '@services/api/base-constancia.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '@services/auth.service';

describe('NuevosComponent - fondo header strip', () => {
  let component: NuevosComponent;
  let fixture: ComponentFixture<NuevosComponent>;

  beforeEach(async () => {
    const lotesSpy = jasmine.createSpyObj('LotesService', ['addAsync']);
    lotesSpy.addAsync.and.returnValue(Promise.resolve({ success: true }));

    const baseSpy = jasmine.createSpyObj('BaseConstanciaService', ['getAllAsync']);
    baseSpy.getAllAsync.and.returnValue(Promise.resolve({ success: true, data: [] }));

    const msgSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    const authSpy = { userId: () => 9 };

    await TestBed.configureTestingModule({
      imports: [NuevosComponent],
      providers: [
        { provide: LotesService, useValue: lotesSpy },
        { provide: BaseConstanciaService, useValue: baseSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: MessageService, useValue: msgSpy },
        { provide: ConfirmationService, useValue: confirmSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('strips data URL header from lote.fondo and constancia.fondoImagen before sending', async () => {
    // prepare lote with headers in fondo and per-constancia fondoImagen
    component.lote.nombreLote = 'test lote';
    component.lote.firmadoresIds = [1];
    component.lote.fondo = 'data:image/png;base64,AAA=';
    component.lote.extFondo = 'png';
    component.lote.lstConstanciasLote = [
      {
        idConstancia: '1',
        nombrePersona: 'Persona',
        rfc: '',
        curp: '',
        email: 'a@b.c',
        fondoImagen: 'data:image/jpeg;base64,BBB=',
        textoHtml: '',
        sello: '',
        identificador: '1',
      },
    ];

    // The AuthService mock returns userId() === 9

    // call onSubmit and wait
    const result = await component.onSubmit();

    expect(result).toBeTrue();

    // the LotesService mock should have been called
    const lotesService = TestBed.inject(LotesService) as any;
    expect(lotesService.addAsync).toHaveBeenCalled();

    const sentPayload = lotesService.addAsync.calls.mostRecent().args[0];
    // fondo must not contain the header
    expect(sentPayload.fondo).toBe('AAA=');
    // per-constancia fondoImagen must also be stripped
    expect(sentPayload.lstConstanciasLote[0].fondoImagen).toBe('BBB=');
    // orientation should be mapped to short form: horizontal => 'l' (landscape)
    expect(sentPayload.orientacion).toBe('l');
  });

  it('maps vertical orientation to p (portrait) before sending', async () => {
    component.lote.nombreLote = 'portrait test';
    component.lote.firmadoresIds = [1];
    component.lote.orientacion = 'vertical';
    component.lote.fondo = 'data:image/png;base64,XXX=';
    component.lote.extFondo = 'png';
    component.lote.lstConstanciasLote = [];

    const result = await component.onSubmit();
    expect(result).toBeTrue();

    const lotesService = TestBed.inject(LotesService) as any;
    const sentPayload = lotesService.addAsync.calls.mostRecent().args[0];
    expect(sentPayload.orientacion).toBe('p');
  });
});
