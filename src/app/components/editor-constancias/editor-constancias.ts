import { Component, input, output, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-editor-constancias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, EditorModule],
  templateUrl: './editor-constancias.html',
  styleUrls: ['./editor-constancias.css'],
})
export class EditorConstanciasComponent {
  // Inputs
  selectedFile = input<File | null>(null);
  fondoValue = input<string>('');
  loading = input<boolean>(false);

  // Two-way binding para editorContent
  editorContent = model<string>('');

  // Outputs
  onCancel = output<void>();
  onSave = output<void>();
}
