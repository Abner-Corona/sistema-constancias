import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LoginResponse } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PostServiceService {
  constructor() {}

  logInSuscribe(formData: FormData): Observable<LoginResponse> {
    // Mock implementation - replace with actual API call
    return of({
      success: true,
      data: {
        id: 1,
        usuario: 'admin',
        nombre: 'Administrador',
        perfiles: ['admin'],
        activo: true,
      },
    });
  }
}
