import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ByteArrayResponseModel, StringResponseModel } from '@models/response-models';

/**
 * Servicio para manejar operaciones de PDFs.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class PdfService extends BaseApiService {
  /**
   * Genera un PDF para una constancia.
   * @param data Datos para generar el PDF.
   * @returns Observable con la respuesta.
   */
  postPdf(data: any): Observable<any> {
    return this.http.post('Pdf/Post', data);
  }

  /**
   * Genera un PDF para una constancia (versión async/await).
   * @param data Datos para generar el PDF.
   * @returns Promise con la respuesta.
   */
  async postPdfAsync(data: any): Promise<any> {
    return this.executeAsync(this.postPdf(data));
  }

  /**
   * Obtiene el PDF de una constancia específica.
   * @param idLote ID del lote.
   * @param idConstancia ID de la constancia.
   * @returns Observable con el PDF.
   */
  getPdfConstancia(idLote: number, idConstancia: number): Observable<ByteArrayResponseModel> {
    return this.http.get<ByteArrayResponseModel>(
      `Pdf/GetPdfConstancia/GetPdfConstancia/${idLote}/${idConstancia}`
    );
  }

  /**
   * Obtiene el PDF de una constancia específica (versión async/await).
   * @param idLote ID del lote.
   * @param idConstancia ID de la constancia.
   * @returns Promise con el PDF.
   */
  async getPdfConstanciaAsync(
    idLote: number,
    idConstancia: number
  ): Promise<ByteArrayResponseModel> {
    return this.executeAsync(this.getPdfConstancia(idLote, idConstancia));
  }

  /**
   * Obtiene la constancia en formato PDF.
   * @param id ID de la constancia.
   * @returns Observable con el PDF.
   */
  getConstanciaPdf(id: number): Observable<ByteArrayResponseModel> {
    return this.http.get<ByteArrayResponseModel>(`Pdf/ConstanciaPdf?id=${id}`);
  }

  /**
   * Obtiene la constancia en formato PDF (versión async/await).
   * @param id ID de la constancia.
   * @returns Promise con el PDF.
   */
  async getConstanciaPdfAsync(id: number): Promise<ByteArrayResponseModel> {
    return this.executeAsync(this.getConstanciaPdf(id));
  }

  /**
   * Carga la base de datos para PDFs.
   * @returns Observable con la respuesta.
   */
  cargaBD(): Observable<any> {
    return this.http.post('Pdf/CargaBD', {});
  }

  /**
   * Carga la base de datos para PDFs (versión async/await).
   * @returns Promise con la respuesta.
   */
  async cargaBDAsync(): Promise<any> {
    return this.executeAsync(this.cargaBD());
  }

  /**
   * Genera PDF para un lote.
   * @param data Datos del lote.
   * @returns Observable con la respuesta.
   */
  pdfLote(data: any): Observable<any> {
    return this.http.post('Pdf/PdfLote', data);
  }

  /**
   * Genera PDF para un lote (versión async/await).
   * @param data Datos del lote.
   * @returns Promise con la respuesta.
   */
  async pdfLoteAsync(data: any): Promise<any> {
    return this.executeAsync(this.pdfLote(data));
  }

  /**
   * Obtiene una imagen por nombre.
   * @param nombreImagen Nombre de la imagen.
   * @returns Observable con la imagen.
   */
  getImagen(nombreImagen: string): Observable<ByteArrayResponseModel> {
    return this.http.get<ByteArrayResponseModel>(`Pdf/GetImagen/GetImagen/${nombreImagen}`);
  }

  /**
   * Obtiene una imagen por nombre (versión async/await).
   * @param nombreImagen Nombre de la imagen.
   * @returns Promise con la imagen.
   */
  async getImagenAsync(nombreImagen: string): Promise<ByteArrayResponseModel> {
    return this.executeAsync(this.getImagen(nombreImagen));
  }

  /**
   * Crea una nueva imagen.
   * @param nombreImagen Nombre de la imagen.
   * @param data Datos de la imagen.
   * @returns Observable con la respuesta.
   */
  creaImagen(nombreImagen: string, data: any): Observable<any> {
    return this.http.post(`Pdf/PostCreaImagen/PostCreaImagen?nombreImagen=${nombreImagen}`, data);
  }

  /**
   * Crea una nueva imagen (versión async/await).
   * @param nombreImagen Nombre de la imagen.
   * @param data Datos de la imagen.
   * @returns Promise con la respuesta.
   */
  async creaImagenAsync(nombreImagen: string, data: any): Promise<any> {
    return this.executeAsync(this.creaImagen(nombreImagen, data));
  }
}
