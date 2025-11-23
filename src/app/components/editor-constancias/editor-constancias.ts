import { Component, input, output, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';

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
}

@Component({
  selector: 'app-editor-constancias',
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
  ],
  templateUrl: './editor-constancias.html',
  styleUrls: ['./editor-constancias.css'],
})
export class EditorConstanciasComponent {
  // Inputs
  selectedFile = input<File | null>(null);
  fondoValue = input<string>('');
  loading = input<boolean>(false);
  visible = model<boolean>(false);

  // Two-way binding para editorContent (HTML output)
  editorContent = model<string>('');

  // Outputs
  onCancel = output<void>();
  onSave = output<void>();
  // Emite cambios de orientación (horizontal | vertical)
  orientationChange = output<'horizontal' | 'vertical'>();

  // Valor de orientación recibido desde el padre (input)
  orientation = input<'horizontal' | 'vertical'>('horizontal');

  // Recibe el objeto completo del formulario (lote) desde el padre
  formValue = input<any>(null);

  // Text elements
  textElements = signal<TextElement[]>([]);

  // Selected element for editing
  selectedElement = signal<TextElement | null>(null);

  // Overlay panel reference
  editPanel: any;

  // Font families
  fontFamilies = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
  ];

  // Add new text element
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
    };
    this.textElements.update((elements) => [...elements, newElement]);
    this.updateHtmlOutput();
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
    };
    this.textElements.update((elements) => [...elements, newElement]);
    this.updateHtmlOutput();
  }

  addQR() {
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
    };
    this.textElements.update((elements) => [...elements, newElement]);
    this.updateHtmlOutput();
  }

  // Remove text element
  removeText(id: string) {
    this.textElements.update((elements) => elements.filter((el) => el.id !== id));
    this.updateHtmlOutput();
  }

  // On drag end
  onDragEnd(event: CdkDragEnd, element: TextElement) {
    const transform = event.source.element.nativeElement.style.transform;
    const match = transform.match(/translate3d\(([^,]+),\s*([^,]+),/);
    if (match) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      this.textElements.update((elements) =>
        elements.map((el) => (el.id === element.id ? { ...el, x: el.x + x, y: el.y + y } : el))
      );
      // Reset transform
      event.source.element.nativeElement.style.transform = '';
      this.updateHtmlOutput();
    }
  }

  // Cambia la orientación y emite el cambio al padre
  onOrientationToggle(isHorizontal: boolean) {
    const newVal: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';
    try {
      this.orientationChange.emit(newVal);
    } catch (e) {
      // keep silent if emit not connected
    }
  }

  // Open edit panel
  openEditPanel(event: Event, element: TextElement) {
    this.selectedElement.set(element);
  }

  // Update selected element
  updateSelectedElement() {
    const selected = this.selectedElement();
    if (selected) {
      this.textElements.update((elements) =>
        elements.map((el) => (el.id === selected.id ? selected : el))
      );
      this.updateHtmlOutput();
    }
  }

  // Generate HTML output
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
    font-family: ${el.fontFamily};
    font-size: ${el.fontSize}px;
    color: ${el.color};
    font-weight: ${el.bold ? 'bold' : 'normal'};
    font-style: ${el.italic ? 'italic' : 'normal'};
    white-space: nowrap;
  ">${el.text}</div>
  `
    )
    .join('')}
</div>
    `;
    this.editorContent.set(html.trim());
  }
}
