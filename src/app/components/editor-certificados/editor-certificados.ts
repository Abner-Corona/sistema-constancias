import {
  Component,
  input,
  output,
  signal,
  model,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import type { LoteEntrada } from '@models/lote-models';
import type { ConstanciaEntrada } from '@models/constancia-models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  // QR specific fields
  isQR?: boolean;
  qrText?: string;
}

// Tag shown in the left panel
type TagItem = { label?: string; value?: string };

// Minimal subset of external manipulation event data we used previously.
// NOTE: event payloads are handled as unknown and narrowed where needed.

@Component({
  selector: 'app-editor-certificados',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    ToggleSwitchModule,
    TooltipModule,
    DialogModule,
    DragDropModule,
    PinchZoomComponent,
  ],
  templateUrl: './editor-certificados.html',
  styleUrls: ['./editor-certificados.css'],
})
export class EditorCertificadosComponent implements OnInit, OnDestroy {
  // Entradas
  selectedFile = input<File | null>(null);
  fondoValue = input<string>('');
  loading = input<boolean>(false);
  visible = model<boolean>(false);

  // Binding bidireccional para editorContent (salida HTML)
  editorContent = model<string>('');

  // Salidas
  onCancel = output<void>();
  onSave = output<void>();
  // Emite cambios de orientación (horizontal | vertical)
  orientationChange = output<'horizontal' | 'vertical'>();

  // Valor de orientación recibido desde el padre (input)
  orientation = input<'horizontal' | 'vertical'>('horizontal');

  // Recibe el objeto completo del formulario (lote) desde el padre
  // Evita usar `any` — usamos el modelo `LoteEntrada` definido en @models/lote-models
  formValue = input<LoteEntrada | null>(null);

  // Elementos de texto
  textElements = signal<TextElement[]>([]);

  // Estadísticas de constancias — almacenamos la constancia completa
  // con el nombre más largo y la más corto. Se calculan en ngOnInit.
  personaLargo: ConstanciaEntrada | null = null;
  personaCorto: ConstanciaEntrada | null = null;

  // Constancia visible que se mostrará en las etiquetas (objeto completo)
  personaVisible = signal<ConstanciaEntrada | null>(null);

  // Toggle para mostrar nombre largo (true) o corto (false)
  showLongName = signal<boolean>(true);

  ngOnInit(): void {
    // Calculamos inicialmente las personas disponibles (nombre largo / corto)
    this.refreshPersonas();
    // initialize the left-panel tags from form value / personaVisible
    if (this.availableTags().length === 0) this.availableTags.set(this.buildDefaultTags());
    // register undo/redo keyboard shortcuts
    window.addEventListener('keydown', this.boundKeyDown as EventListener);
    // initial history snapshot
    this.pushHistory();
  }

  /**
   * Recalcula personaLargo, personaCorto y personaVisible desde el input `formValue`.
   * Esta función es pública para que el padre la invoque cuando actualice `formValue`
   * (por ejemplo justo antes de abrir el diálogo del editor).
   */
  refreshPersonas() {
    const fv = this.formValue();
    const list = fv?.lstConstanciasLote ?? [];
    const names = list
      .map((c: unknown) => ((c as ConstanciaEntrada)?.nombrePersona ?? '').trim())
      .filter((n: string) => n.length > 0);

    if (names.length === 0) {
      this.personaLargo = null;
      this.personaCorto = null;
      this.personaVisible.set(null);
      return;
    }

    let longestObj: ConstanciaEntrada | null = null;
    let shortestObj: ConstanciaEntrada | null = null;

    for (const c of list) {
      const n = (c?.nombrePersona ?? '').trim();
      if (!n) continue;
      if (!longestObj || n.length > (longestObj.nombrePersona ?? '').length) longestObj = c;
      if (!shortestObj || n.length < (shortestObj.nombrePersona ?? '').length) shortestObj = c;
    }

    this.personaLargo = longestObj;
    this.personaCorto = shortestObj;

    // Inicializamos la persona visible según el toggle actual
    this.personaVisible.set(this.showLongName() ? this.personaLargo : this.personaCorto);

    // initialize available tags when refreshing personas if not already initialized
    if (this.availableTags().length === 0) this.availableTags.set(this.buildDefaultTags());
  }

  // Handler cuando el usuario alterna mostrar nombre largo/corto
  onShowLongToggle(value: boolean) {
    // preserve the previous visible name so we can update existing
    // elements whose text matches the old visible name
    const prevVisibleName = this.personaVisible()?.nombrePersona ?? '';

    this.showLongName.set(value);
    this.personaVisible.set(value ? this.personaLargo : this.personaCorto);

    // update canvas elements that contain the previous visible name
    const newVisibleName = this.personaVisible()?.nombrePersona ?? '';
    if (prevVisibleName && prevVisibleName.trim() !== newVisibleName.trim()) {
      const before = prevVisibleName.trim();
      const after = newVisibleName.trim();
      const changedIds: string[] = [];

      this.textElements.update((els) =>
        els.map((e) => {
          // Skip QR elements and empty text
          if (e.isQR) return e;
          const t = e.text ?? '';
          if (!t || !before) return e;

          // Replace occurrences of the previous visible name inside the element text.
          // We prefer a simple split/join which is safe and works across environments
          // rather than relying on RegExp replaceAll.
          if (t === before) {
            changedIds.push(e.id);
            return { ...e, text: after } as TextElement;
          }

          if (t.includes(before)) {
            changedIds.push(e.id);
            return { ...e, text: t.split(before).join(after) } as TextElement;
          }

          return e;
        })
      );

      // re-measure changed elements to fit new text (deferred so DOM updates)
      for (const id of changedIds) {
        // measure in next frame
        setTimeout(() => void this.measureAndSetElementSize(id), 0);
      }

      // Update HTML output and push history snapshot for the change
      if (changedIds.length > 0) {
        this.updateHtmlOutput();
        this.pushHistory();
      }
    }
    // Update available tags (Nombre, CURP, RFC) when toggling the visible persona
    // so the left-panel reflects the selected short/long name immediately.
    const defaults = this.buildDefaultTags();
    const currentTags = this.availableTags();
    if (currentTags.length === 0) {
      this.availableTags.set(defaults);
    } else {
      this.availableTags.update((list) =>
        list.map((t) => {
          if (!t.label) return t;
          const def = defaults.find((d) => d.label === t.label);
          // Only update values for tags that exist in defaults (Nombre, CURP, RFC, etc.)
          if (!def) return t;
          return { ...t, value: def.value };
        })
      );
    }
  }

  // Elemento seleccionado para edición
  selectedElement = signal<TextElement | null>(null);

  // Referencia al canvas donde se dropean las etiquetas
  @ViewChild('editorCanvas', { static: false }) editorCanvas?: ElementRef;

  // Referencia al panel (overlay) de edición
  // No usar `any` — puede ser un HTMLElement o null
  editPanel: HTMLElement | null = null;

  // Familias de fuentes
  fontFamilies = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
  ];

  // Añadir nuevo elemento de texto
  addCourseName() {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: 'Nombre del Curso',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial',
      bold: true,
      italic: false,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: 200,
      height: 30,
    };
    this.textElements.update((elements) => [...elements, newElement]);
    // allow DOM to render and measure text so width/height fit the content
    setTimeout(() => void this.measureAndSetElementSize(newElement.id), 0);
    this.updateHtmlOutput();
    this.pushHistory();
  }

  // Devuelve selector del elemento seleccionado (usado por interacción)
  getSelectedTarget(): string | null {
    const sel = this.selectedElement();
    if (!sel) return null;
    return '#el-' + sel.id;
  }

  // Inicio de drag desde una etiqueta (card) del panel de tags
  onTagDragStart(ev: DragEvent, tag: TagItem) {
    try {
      const payload = { label: tag.label, value: tag.value };
      ev.dataTransfer?.setData('application/json', JSON.stringify(payload));
      ev.dataTransfer!.effectAllowed = 'copy';
    } catch (e) {
      // ignore
    }
  }

  // Click en una etiqueta para agregarla directamente al canvas
  async onTagClick(ev: Event, tag: TagItem) {
    // Verificar si el elemento ya existe
    if (this.textElements().some((el) => el.text === tag.value)) {
      return; // No agregar si ya existe
    }

    const isQr = (tag.value ?? tag.label) === '[QR]';
    // If we have a canvas size we can initialize QR elements sized relative
    // to the paper so they won't overflow. For normal text tags we still
    // use the compact default and measure to fit text.
    let initialWidth = isQr ? 140 : 100;
    let initialHeight = isQr ? 140 : 20;
    const canvasEl = this.editorCanvas?.nativeElement as HTMLElement | undefined;
    if (isQr && canvasEl) {
      const crect = canvasEl.getBoundingClientRect();
      initialWidth = Math.min(initialWidth, Math.max(40, Math.round(crect.width * 0.28)));
      initialHeight = Math.min(initialHeight, Math.max(32, Math.round(crect.height * 0.18)));
    }

    const newElement: TextElement = {
      id: Date.now().toString(),
      text: tag.value ?? tag.label ?? 'Texto',
      x: 100,
      y: 100,
      fontSize: 18,
      color: '#000',
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: initialWidth,
      height: initialHeight,
      isQR: isQr || undefined,
      qrText: isQr
        ? 'MinUU1T5iUA8T4XANFvXDMDBdyQqM1H94uEVHQq2KJuF8DH9U1iFoI5PWs6tMHib4EAW3pYzwcyHpyWhsisEz/o38Ytpst1ysoySKkXfXp9UnfTHcBKSyAhy3wzQ02vU1H1O77NfCWTN42mdUZA58WEMP8mVpvgIWz/ObxeMsgN6XyTOKfAxQD7o0dV/HKhxb8oSc5kzG09KpU3/XawzBDnszzE0dP4Q3evaYzuJiMkjGF2EV840iFr4qnUYTNK06L8bGTWzZUjs+rEo4Getku6oR3igmkpP1x5yxiMRNIOl3WNWyIomm2jq7O5j+M92/Kqglf+unf7AqyKaLS9FtQ=='
        : undefined,
    };

    this.textElements.update((elements) => [...elements, newElement]);
    // seleccionar el nuevo elemento en el canvas and size to content
    await Promise.resolve();
    this.selectedElement.set(newElement);
    // wait a frame — for non-QR elements measure text size and update width/height
    if (!isQr) await this.measureAndSetElementSize(newElement.id);
    // remove the used tag from availableTags so it won't appear in the left panel
    this.availableTags.update((list) =>
      list.filter((t) => !(t.label === tag.label && t.value === tag.value))
    );
    this.pushHistory();
  }

  onCanvasDragOver(ev: DragEvent) {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
  }

  async onCanvasDrop(ev: DragEvent) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('application/json');
    if (!data) return;
    let payload: { label?: string; value?: string } | null = null;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      // Data may be plain string — wrap safely as a string value
      payload = { value: String(data) };
    }

    if (!payload) return;
    const isQr = (payload.value ?? payload.label) === '[QR]';

    // Verificar si el elemento ya existe
    if (this.textElements().some((el) => el.text === (payload.value ?? payload.label))) {
      return; // No agregar si ya existe
    }

    // calcular posición relativa al canvas
    const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = Math.max(0, Math.round(ev.clientX - rect.left));
    const y = Math.max(0, Math.round(ev.clientY - rect.top));

    // Determine a sensible initial size. For QR elements we keep sizes
    // relative to the canvas so they don't overflow the paper.
    let initialWidth = isQr ? 140 : 100;
    let initialHeight = isQr ? 140 : 20;
    if (isQr && rect) {
      initialWidth = Math.min(initialWidth, Math.max(40, Math.round(rect.width * 0.28)));
      initialHeight = Math.min(initialHeight, Math.max(32, Math.round(rect.height * 0.18)));
    }

    const newElement: TextElement = {
      id: Date.now().toString(),
      text: payload.value ?? payload.label ?? 'Texto',
      x: x,
      y: y,
      fontSize: 18,
      color: '#000',
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: initialWidth,
      height: initialHeight,
      isQR: isQr || undefined,
      qrText: isQr
        ? 'MinUU1T5iUA8T4XANFvXDMDBdyQqM1H94uEVHQq2KJuF8DH9U1iFoI5PWs6tMHib4EAW3pYzwcyHpyWhsisEz/o38Ytpst1ysoySKkXfXp9UnfTHcBKSyAhy3wzQ02vU1H1O77NfCWTN42mdUZA58WEMP8mVpvgIWz/ObxeMsgN6XyTOKfAxQD7o0dV/HKhxb8oSc5kzG09KpU3/XawzBDnszzE0dP4Q3evaYzuJiMkjGF2EV840iFr4qnUYTNK06L8bGTWzZUjs+rEo4Getku6oR3igmkpP1x5yxiMRNIOl3WNWyIomm2jq7O5j+M92/Kqglf+unf7AqyKaLS9FtQ=='
        : undefined,
    };

    this.textElements.update((elements) => [...elements, newElement]);
    // seleccionar el nuevo elemento — esperar a que Angular renderice el DOM
    await Promise.resolve();
    this.selectedElement.set(newElement);
    // measure its natural size and update state
    if (!isQr) await this.measureAndSetElementSize(newElement.id);
    // if this drop came from a tag (payload), remove tag from availableTags
    if (payload?.value || payload?.label) {
      const val = payload.value ?? payload.label;
      this.availableTags.update((list) =>
        list.filter((t) => !(t.value === val || t.label === val))
      );
    }
    this.pushHistory();
  }

  // (global selected-element handlers removed; we use per-element handlers)

  // --- Drag inside canvas using pointer events (replaces ngx-moveable) ---
  // Id of element currently being dragged (or null)
  draggingElementId: string | null = null;

  // Internal drag start state for the active element
  private dragStartState = { startX: 0, startY: 0, mouseX: 0, mouseY: 0 };

  // Flag to ignore click if a drag moved the element
  private dragHasMoved = false;

  // Resize state
  resizingElementId: string | null = null;
  private resizeStartState: {
    startWidth: number;
    startHeight: number;
    startFontSize?: number;
    mouseX: number;
    mouseY: number;
    handle: string | null;
    centerX: number;
    centerY: number;
    startRotation: number;
  } = {
    startWidth: 0,
    startHeight: 0,
    mouseX: 0,
    mouseY: 0,
    handle: null,
    centerX: 0,
    centerY: 0,
    startRotation: 0,
  };

  // Rotate state
  rotatingElementId: string | null = null;
  rotatingAngleDisplay = signal<number | null>(null);
  private rotateStartState = { centerX: 0, centerY: 0, startAngle: 0, mouseX: 0, mouseY: 0 };

  // History stack for undo/redo
  private history: TextElement[][] = [];
  private historyIndex = -1;
  private gridSize = 8; // grid snapping size (px)
  private enableSnapping = true;

  // Bound arrow handlers so we can add/remove event listeners safely
  private boundPointerMove = (ev: PointerEvent) => this.onPointerMove(ev);
  private boundPointerUp = (ev: PointerEvent) => this.onPointerUp(ev);

  ngOnDestroy(): void {
    // Ensure we remove any global listeners if component destroyed mid-drag
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown as EventListener);
  }

  // ngOnInit is defined earlier (we add keyboard registration and initial history in the top ngOnInit)

  private boundKeyDown = (ev: KeyboardEvent) => this.onKeyDown(ev);

  private onKeyDown(ev: KeyboardEvent) {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const meta = isMac ? ev.metaKey : ev.ctrlKey;
    if (meta && ev.key === 'z') {
      ev.preventDefault();
      this.undo();
    } else if ((meta && ev.key === 'y') || (meta && ev.shiftKey && ev.key === 'Z')) {
      ev.preventDefault();
      this.redo();
    }
  }

  // (Drag & drop inside the canvas is handled by startElementDrag / onPointerMove / onPointerUp)

  // Start dragging a text element using pointer events. This updates
  // the element.x and element.y in real time while dragging.
  startElementDrag(ev: PointerEvent, element: TextElement) {
    ev.preventDefault();

    // Only begin a new drag if clicking on a valid element
    const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
    if (!canvasEl) return;

    // capture state
    this.draggingElementId = element.id;
    this.dragStartState.startX = element.x;
    this.dragStartState.startY = element.y;
    this.dragStartState.mouseX = ev.clientX;
    this.dragStartState.mouseY = ev.clientY;
    this.dragHasMoved = false;

    try {
      (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
    } catch (_) {
      // ignore pointer capture errors
    }

    // add global listeners so dragging continues even if pointer leaves the element
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
  }

  /**
   * Measure an element DOM node and update its width/height to fit the text content.
   * Attempts a few animation frames if the element isn't present immediately.
   */
  async measureAndSetElementSize(elementId: string, maxAttempts = 8): Promise<void> {
    const id = '#el-' + elementId;
    let el: HTMLElement | null = null;
    for (let i = 0; i < maxAttempts; i++) {
      // give Angular a frame to render
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => requestAnimationFrame(r));
      el = this.editorCanvas?.nativeElement?.querySelector(id) ?? document.querySelector(id);
      if (el) break;
    }

    if (!el) return; // couldn't find it

    // If this is a QR element, avoid measuring the clone because
    // the SVG and long payload can grow the measured size beyond
    // the canvas. We prefer to keep QR elements at a reasonable
    // default size relative to the canvas.
    const elementState = this.textElements().find((t) => t.id === elementId);
    if (elementState?.isQR) {
      // Clamp QR size to not overflow the paper/canvas
      const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
      if (canvasEl) {
        const canvasRect = canvasEl.getBoundingClientRect();
        // Allow QR box to be at most 40% of canvas width and 30% of canvas height
        const maxW = Math.max(40, Math.round(canvasRect.width * 0.4));
        const maxH = Math.max(32, Math.round(canvasRect.height * 0.3));
        const width = Math.min(elementState.width || maxW, maxW);
        const height = Math.min(elementState.height || maxH, maxH);
        this.textElements.update((els) =>
          els.map((e) => (e.id === elementId ? { ...e, width, height } : e))
        );
      }
      return;
    }

    // measure natural size of content (text) without forcing constraints
    // Create a temporary clone, use same computed styles to measure accurately
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.width = 'auto';
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    document.body.appendChild(clone);
    const rect = clone.getBoundingClientRect();
    document.body.removeChild(clone);

    // update the element's width/height in state (use Math.ceil to avoid clipping)
    const width = Math.max(10, Math.ceil(rect.width));
    const height = Math.max(8, Math.ceil(rect.height));

    this.textElements.update((els) =>
      els.map((e) => (e.id === elementId ? { ...e, width, height } : e))
    );
    // push updated HTML output
    this.updateHtmlOutput();
  }

  private onPointerMove(ev: PointerEvent) {
    // RESIZE mode
    if (this.resizingElementId) {
      const el = this.textElements().find((t) => t.id === this.resizingElementId);
      if (!el) return;

      const handle = this.resizeStartState.handle ?? 'se';
      const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
      const rect = canvasEl?.getBoundingClientRect();

      // helpers for rotation transforms
      const toLocal = (clientX: number, clientY: number) => {
        const cx = this.resizeStartState.centerX;
        const cy = this.resizeStartState.centerY;
        const theta = (this.resizeStartState.startRotation ?? 0) * (Math.PI / 180);
        const dx = clientX - cx;
        const dy = clientY - cy;
        // rotate by -theta to get local coords
        const cos = Math.cos(-theta);
        const sin = Math.sin(-theta);
        return { x: cos * dx - sin * dy, y: sin * dx + cos * dy };
      };

      const toWorldFromLocal = (lx: number, ly: number) => {
        const cx = this.resizeStartState.centerX;
        const cy = this.resizeStartState.centerY;
        const theta = (this.resizeStartState.startRotation ?? 0) * (Math.PI / 180);
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const wx = cx + (cos * lx - sin * ly);
        const wy = cy + (sin * lx + cos * ly);
        return { x: wx, y: wy };
      };

      // pointer local coords relative to element center
      const pLocal = toLocal(ev.clientX, ev.clientY);

      const startW = this.resizeStartState.startWidth;
      const startH = this.resizeStartState.startHeight;

      // opposite corner in local coordinates (based on handle)
      let oppX = 0;
      let oppY = 0;
      // map handle to opposite corner
      switch (handle) {
        case 'nw':
          oppX = startW / 2;
          oppY = startH / 2;
          break;
        case 'n':
          oppX = 0;
          oppY = startH / 2;
          break;
        case 'ne':
          oppX = -startW / 2;
          oppY = startH / 2;
          break;
        case 'e':
          oppX = -startW / 2;
          oppY = 0;
          break;
        case 'se':
          oppX = -startW / 2;
          oppY = -startH / 2;
          break;
        case 's':
          oppX = 0;
          oppY = -startH / 2;
          break;
        case 'sw':
          oppX = startW / 2;
          oppY = -startH / 2;
          break;
        case 'w':
          oppX = startW / 2;
          oppY = 0;
          break;
        default:
          oppX = -startW / 2;
          oppY = -startH / 2;
      }

      // compute new width/height in local coords
      let newW = Math.abs(pLocal.x - oppX);
      let newH = Math.abs(pLocal.y - oppY);

      // preserve axis when handle is center-edge
      if (handle === 'n' || handle === 's') newW = startW;
      if (handle === 'e' || handle === 'w') newH = startH;

      const minW = 10;
      const minH = 8;
      newW = Math.max(minW, newW);
      newH = Math.max(minH, newH);

      // center in local coords
      const newCenterLocalX = (pLocal.x + oppX) / 2;
      const newCenterLocalY = (pLocal.y + oppY) / 2;

      // convert center back to viewport/world coords
      const newCenterWorld = toWorldFromLocal(newCenterLocalX, newCenterLocalY);

      // convert center to canvas local coords
      const canvasLeft = rect?.left ?? 0;
      const canvasTop = rect?.top ?? 0;
      const newTopLeftX = Math.round(newCenterWorld.x - newW / 2 - canvasLeft);
      const newTopLeftY = Math.round(newCenterWorld.y - newH / 2 - canvasTop);

      // apply snapping if enabled
      const snap = (v: number) =>
        this.enableSnapping ? Math.round(v / this.gridSize) * this.gridSize : Math.round(v);
      const snappedW = snap(newW);
      const snappedH = snap(newH);
      let snappedX = snap(newTopLeftX);
      let snappedY = snap(newTopLeftY);

      // clamp to canvas
      if (rect) {
        const maxX = Math.max(0, Math.round(rect.width - snappedW));
        const maxY = Math.max(0, Math.round(rect.height - snappedH));
        snappedX = Math.max(0, Math.min(snappedX, maxX));
        snappedY = Math.max(0, Math.min(snappedY, maxY));
      }

      // compute font-size scaling based on which handle moved
      const startFont = this.resizeStartState.startFontSize ?? el.fontSize ?? 16;
      let scaleFactor = 1;
      if (handle === 'n' || handle === 's') {
        scaleFactor = snappedH / startH;
      } else if (handle === 'e' || handle === 'w') {
        scaleFactor = snappedW / startW;
      } else {
        // average scale from both axes for corners
        scaleFactor = (snappedW / startW + snappedH / startH) / 2;
      }
      // enforce limits
      const minFont = 6;
      const newFontSize = Math.max(minFont, Math.round(startFont * scaleFactor));

      this.textElements.update((els) =>
        els.map((e) =>
          e.id === el.id
            ? {
                ...e,
                x: snappedX,
                y: snappedY,
                width: snappedW,
                height: snappedH,
                fontSize: newFontSize,
              }
            : e
        )
      );

      this.dragHasMoved = true;
      return;
    }

    // ROTATE mode
    if (this.rotatingElementId) {
      const el = this.textElements().find((t) => t.id === this.rotatingElementId);
      if (!el) return;

      // compute angle between center and current pointer
      const cx = this.rotateStartState.centerX;
      const cy = this.rotateStartState.centerY;
      const angleRad = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      const angleDeg = (angleRad * 180) / Math.PI;
      // compute delta relative to startAngle
      const delta = Math.round(angleDeg - this.rotateStartState.startAngle);
      const newRotation = (this.rotateStartState.startAngle + delta + 360) % 360;

      this.textElements.update((els) =>
        els.map((e) => (e.id === el.id ? { ...e, rotation: newRotation } : e))
      );
      this.rotatingAngleDisplay.set(newRotation);
      this.dragHasMoved = true;
      return;
    }

    // DRAG mode
    if (!this.draggingElementId) return;

    const dx = Math.round(ev.clientX - this.dragStartState.mouseX);
    const dy = Math.round(ev.clientY - this.dragStartState.mouseY);

    const newX = Math.max(0, this.dragStartState.startX + dx);
    const newY = Math.max(0, this.dragStartState.startY + dy);

    // clamp to canvas bounds if possible
    const canvasEl2: HTMLElement | undefined = this.editorCanvas?.nativeElement;
    const el2 = this.textElements().find((t) => t.id === this.draggingElementId);
    if (!el2) return;
    if (canvasEl2) {
      const rect = canvasEl2.getBoundingClientRect();
      const maxX = Math.max(0, Math.round(rect.width - el2.width));
      const maxY = Math.max(0, Math.round(rect.height - el2.height));
      const clampedX = Math.min(newX, maxX);
      const clampedY = Math.min(newY, maxY);

      // snapping
      const snap = (v: number) =>
        this.enableSnapping ? Math.round(v / this.gridSize) * this.gridSize : Math.round(v);
      const finalX = snap(clampedX);
      const finalY = snap(clampedY);
      this.textElements.update((els) =>
        els.map((e) => (e.id === el2.id ? { ...e, x: finalX, y: finalY } : e))
      );
    } else {
      const snap = (v: number) =>
        this.enableSnapping ? Math.round(v / this.gridSize) * this.gridSize : Math.round(v);
      this.textElements.update((els) =>
        els.map((e) => (e.id === el2.id ? { ...e, x: snap(newX), y: snap(newY) } : e))
      );
    }

    this.dragHasMoved = true;
  }

  private onPointerUp(ev: PointerEvent) {
    if (!this.draggingElementId && !this.resizingElementId && !this.rotatingElementId) return;

    // release capture
    try {
      (ev.target as HTMLElement).releasePointerCapture?.(ev.pointerId);
    } catch (_) {
      // ignore
    }

    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);

    // finalize — persist new position in the model and update the HTML output
    if (this.dragHasMoved) {
      this.updateHtmlOutput();
      this.pushHistory();
    }

    // clear rotation UI
    this.rotatingAngleDisplay.set(null);

    this.draggingElementId = null;
    this.resizingElementId = null;
    this.rotatingElementId = null;
  }

  // Start resizing via pointer events (bottom-right corner)
  startResize(ev: PointerEvent, element: TextElement, handle: string) {
    ev.preventDefault();
    ev.stopPropagation();

    // ensure element is selected for visible handles
    this.selectedElement.set(element);
    this.dragHasMoved = false;

    // element center in viewport coords
    const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const centerX = rect.left + Math.round(element.x + element.width / 2);
    const centerY = rect.top + Math.round(element.y + element.height / 2);

    this.resizingElementId = element.id;
    this.resizeStartState = {
      startWidth: element.width,
      startHeight: element.height,
      startFontSize: element.fontSize ?? 16,
      mouseX: ev.clientX,
      mouseY: ev.clientY,
      handle: handle,
      centerX,
      centerY,
      startRotation: element.rotation ?? 0,
    };

    try {
      (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
    } catch (_) {}

    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
  }

  // Undo / redo helpers
  private pushHistory() {
    // snapshot current state (deep clone)
    const snapshot = this.textElements().map((e) => ({ ...e }));
    // if we are not at end, drop forward states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;
    // keep history to reasonable size
    if (this.history.length > 200) this.history.shift();
  }

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex -= 1;
    const snapshot = this.history[this.historyIndex];
    this.textElements.set(snapshot.map((e) => ({ ...e })));
    this.updateHtmlOutput();
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex += 1;
    const snapshot = this.history[this.historyIndex];
    this.textElements.set(snapshot.map((e) => ({ ...e })));
    this.updateHtmlOutput();
  }

  // Start rotation via pointer events (top handle)
  startRotate(ev: PointerEvent, element: TextElement) {
    ev.preventDefault();
    ev.stopPropagation();

    // ensure element is selected for visible handles
    this.selectedElement.set(element);
    this.dragHasMoved = false;

    this.rotatingElementId = element.id;
    this.rotateStartState.startAngle = element.rotation ?? 0;
    this.rotateStartState.mouseX = ev.clientX;
    this.rotateStartState.mouseY = ev.clientY;

    // compute center point of element in viewport coordinates
    const canvasEl: HTMLElement | undefined = this.editorCanvas?.nativeElement;
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const centerX = rect.left + Math.round(element.x + element.width / 2);
      const centerY = rect.top + Math.round(element.y + element.height / 2);
      this.rotateStartState.centerX = centerX;
      this.rotateStartState.centerY = centerY;
    } else {
      this.rotateStartState.centerX = ev.clientX;
      this.rotateStartState.centerY = ev.clientY;
    }

    // convert startAngle into -180..180 for smoother deltas
    this.rotateStartState.startAngle = ((this.rotateStartState.startAngle + 180) % 360) - 180;

    try {
      (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
    } catch (_) {}

    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
  }

  addSignature() {
    const newElement: TextElement = {
      id: (Date.now() + 1).toString(),
      text: 'Firma',
      x: 200,
      y: 200,
      fontSize: 16,
      color: '#000000',
      fontFamily: 'Times New Roman',
      bold: false,
      italic: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: 100,
      height: 20,
    };
    this.textElements.update((elements) => [...elements, newElement]);
    setTimeout(() => void this.measureAndSetElementSize(newElement.id), 0);
    this.updateHtmlOutput();
    this.pushHistory();
  }

  addQR() {
    // Size the QR element relative to the current canvas so it fits
    // inside the paper by default (if the canvas is available).
    let initialWidth = 140;
    let initialHeight = 80;
    const canvasEl = this.editorCanvas?.nativeElement as HTMLElement | undefined;
    if (canvasEl) {
      const crect = canvasEl.getBoundingClientRect();
      initialWidth = Math.min(initialWidth, Math.max(40, Math.round(crect.width * 0.28)));
      initialHeight = Math.min(initialHeight, Math.max(32, Math.round(crect.height * 0.18)));
    }

    const newElement: TextElement = {
      id: (Date.now() + 2).toString(),
      text: '[QR]',
      x: 300,
      y: 300,
      fontSize: 12,
      color: '#000000',
      fontFamily: 'Courier New',
      bold: false,
      italic: false,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      width: initialWidth,
      height: initialHeight,
      isQR: true,
      qrText:
        'MinUU1T5iUA8T4XANFvXDMDBdyQqM1H94uEVHQq2KJuF8DH9U1iFoI5PWs6tMHib4EAW3pYzwcyHpyWhsisEz/o38Ytpst1ysoySKkXfXp9UnfTHcBKSyAhy3wzQ02vU1H1O77NfCWTN42mdUZA58WEMP8mVpvgIWz/ObxeMsgN6XyTOKfAxQD7o0dV/HKhxb8oSc5kzG09KpU3/XawzBDnszzE0dP4Q3evaYzuJiMkjGF2EV840iFr4qnUYTNK06L8bGTWzZUjs+rEo4Getku6oR3igmkpP1x5yxiMRNIOl3WNWyIomm2jq7O5j+M92/Kqglf+unf7AqyKaLS9FtQ==',
    };
    this.textElements.update((elements) => [...elements, newElement]);
    // For QR elements do not auto-measure (the SVG + payload cause clones
    // to expand beyond the paper). Keep the size computed above.
    this.updateHtmlOutput();
    this.pushHistory();
  }

  // Eliminar elemento de texto
  removeText(id: string) {
    // find the element to be removed so we can reconcile tags
    const elToRemove = this.textElements().find((el) => el.id === id);
    if (!elToRemove) return;

    // remove element
    this.textElements.update((elements) => elements.filter((el) => el.id !== id));
    this.updateHtmlOutput();

    // If the removed element corresponds to a default tag, add that tag back
    const defaults = this.buildDefaultTags();
    const matchingDefault = defaults.find(
      (t) => t.value === elToRemove.text || t.label === elToRemove.text
    );
    if (matchingDefault) {
      // re-add only if not already present
      const exists = this.availableTags().some(
        (t) => t.label === matchingDefault.label && t.value === matchingDefault.value
      );
      if (!exists) this.availableTags.update((list) => [...list, matchingDefault]);
    }

    this.pushHistory();
  }

  // (legacy placeholders removed - we use per-element pointer drag handlers)

  // Cambia la orientación y emite el cambio al padre
  onOrientationToggle(isHorizontal: boolean) {
    const newVal: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';
    try {
      this.orientationChange.emit(newVal);
    } catch (e) {
      // keep silent if emit not connected
    }
  }

  // Abrir panel de edición
  openEditPanel(event: Event, element: TextElement) {
    // If we just performed a drag, ignore the click (prevents opening edit panel when finishing a drag)
    if (this.dragHasMoved) {
      // reset flag and do not open
      this.dragHasMoved = false;
      return;
    }

    this.selectedElement.set(element);
  }

  // Actualizar elemento seleccionado
  updateSelectedElement() {
    const selected = this.selectedElement();
    if (selected) {
      this.textElements.update((elements) =>
        elements.map((el) => (el.id === selected.id ? selected : el))
      );
      this.updateHtmlOutput();
      this.pushHistory();
    }
  }

  // Generar salida HTML
  updateHtmlOutput() {
    const imageUrl = this.fondoValue();
    const html = `
<div style="position: relative; width: 800px; height: 600px; background-image: url('${imageUrl}'); background-size: contain; background-repeat: no-repeat;">
  ${this.textElements()
    .map(
      (el) => `
  <div style="
    position: absolute;
    left: ${el.x}px;
    top: ${el.y}px;
    width: ${el.width}px;
    height: ${el.height}px;
    font-family: ${el.fontFamily};
    font-size: ${el.fontSize}px;
    color: ${el.color};
    font-weight: ${el.bold ? 'bold' : 'normal'};
    font-style: ${el.italic ? 'italic' : 'normal'};
    transform: rotate(${el.rotation}deg) scale(${el.scaleX}, ${el.scaleY});
    transform-origin: center;
    white-space: nowrap;
  ">${el.text}</div>
  `
    )
    .join('')}
</div>
    `;
    this.editorContent.set(html.trim());
  }

  // Guardar / Emitir el contenido actual del editor
  saveTemplate(): void {
    // Ensure the HTML output is fresh
    this.updateHtmlOutput();
    try {
      // Notify parent that the editor was saved
      this.onSave.emit();
    } catch (e) {
      // keep silent if emit isn't connected
    }
  }

  /**
   * Construye el HTML definitivo para una constancia específica usando
   * los elementos del editor y la imagen de fondo actual.
   * Esto permite generar `textoHtml` personalizado para cada registro
   * cuando se crea el lote.
   */
  buildHtmlForConstancia(constancia: ConstanciaEntrada): string {
    const imageUrl = this.fondoValue();

    // Base wrapper (resemble previous app layout)
    const outer = [] as string[];
    outer.push('<body style="margin: 0px;padding: 0px; position:relative;">');
    outer.push(
      `<div style="text-align: center; background-image:url('${imageUrl}'); position:relative; background-position: center; background-repeat: no-repeat; background-size: contain; height:216mm; width:279mm; overflow: hidden;">`
    );

    // Render each editor element as positioned HTML. For QR elements we
    // render the default QR layout used previously (image left / text right)
    const currentPersona = this.personaVisible()?.nombrePersona ?? '';

    for (const el of this.textElements()) {
      if (el.isQR) {
        // QR layout similar to historic HTML: left image, right text area
        const imgWidth = Math.max(40, Math.round(el.width || 100));
        const textPayload = constancia.sello ?? el.qrText ?? el.text ?? '';
        outer.push(
          `<div style="bottom: 20px; margin-left: 22px; position:absolute; width:100%;">
            <div style="width: 100%; display: flex;">
              <div style="float: left; width: ${imgWidth}px;"><img style="width: ${imgWidth}px;" src="/images/qr-code.svg" alt="QR"/></div>
              <div style="float: left; width: calc(100% - ${imgWidth}px); height: ${Math.max(
            32,
            el.height || 100
          )}px; word-wrap: break-word; margin-bottom: auto; margin-top: 10px;">
                <div style="font-size: 11px; color: #000000; font-family:Arial, Helvetica, sans-serif; word-wrap: break-word; margin-left:11px; margin-right: 11px; margin-bottom: 0px; margin-top: auto; text-align:left;">
                  ${this.escapeHtml(textPayload)}
                </div>
              </div>
            </div>
          </div>`
        );
        continue;
      }

      // For normal text elements render absolute positioned blocks. If the
      // element text equals the current persona used while editing we replace
      // it with the constancia's actual nombrePersona so each certificate is
      // personalized.
      let text = el.text ?? '';
      if (text && currentPersona && text.trim() === currentPersona.trim()) {
        text = constancia.nombrePersona ?? text;
      }

      // simple H1-like block (keeps position/size and basic typographic props)
      const fontWeight = el.bold ? 600 : 400;
      const fontStyle = el.italic ? 'italic' : 'normal';
      outer.push(
        `<div style="height:${el.height}px; text-align:center; position:absolute; width:${
          el.width
        }px; left:${el.x}px; top:${el.y}px;">
          <h1 style="color:${el.color}; font-size:${
          el.fontSize
        }px; margin:0px; line-height:${Math.max(
          1,
          Math.round(el.fontSize * 1.05)
        )}px; font-family: ${
          el.fontFamily
        }; font-weight: ${fontWeight}; font-style: ${fontStyle}; position:absolute; bottom:0px; width:100%;">${this.escapeHtml(
          text
        )}</h1>
        </div>`
      );
    }

    outer.push('</div></body>');

    return outer.join('\n');
  }

  // Utility: escape simple HTML characters to avoid injection in saved HTML
  private escapeHtml(inp: string | undefined): string {
    if (!inp) return '';
    return String(inp)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Devuelve el nombre más largo dentro de lstConstanciasLote (si existe)
  longestName(): string {
    const fv = this.formValue();
    if (!fv || !fv.lstConstanciasLote || fv.lstConstanciasLote.length === 0) return 'Nombrex';
    let longest = '';
    for (const c of fv.lstConstanciasLote) {
      const name = c?.nombrePersona ?? '';
      if (name.length > longest.length) longest = name;
    }
    return longest || 'Nombrea';
  }

  // Items simples que se renderizan en el panel de etiquetas
  // --- tag panel state ---
  // held as a mutable signal so items can be removed/added as the user drags/drops
  availableTags = signal<TagItem[]>([]);

  // Build the default tags from the current formValue / personaVisible state
  private buildDefaultTags(): TagItem[] {
    const fv = this.formValue();
    return [
      { label: 'Título', value: fv?.nombreLote ?? 'Título del certificado' },

      {
        label: 'Nombre',
        value: (() => {
          const p = this.personaVisible();
          if (p) return p.nombrePersona?.trim() ?? 'Nombre';
          return fv?.lstConstanciasLote?.[0]?.nombrePersona ?? 'Nombre';
        })(),
      },
      {
        label: 'CURP',
        value: (() => {
          const p = this.personaVisible();
          return p?.curp ?? fv?.lstConstanciasLote?.[0]?.curp ?? '';
        })(),
      },
      {
        label: 'RFC',
        value: (() => {
          const p = this.personaVisible();
          return p?.rfc ?? fv?.lstConstanciasLote?.[0]?.rfc ?? '';
        })(),
      },
      { label: 'QR', value: '[QR]' },
      { label: 'Instructor', value: fv?.instructor ?? 'Nombre del instructor' },
      { label: 'Fecha', value: fv?.fecha ?? 'dd/mm/aaaa' },
    ];
  }

  tagItems() {
    // Do NOT write to signals from template rendering.
    // Return the current availableTags slice; if not yet initialized, fall back to defaults.
    const current = this.availableTags();
    if (current.length === 0) return this.buildDefaultTags();
    return current;
  }
}
