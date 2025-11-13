import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

/**
 * Interceptor para añadir automáticamente la base URL a las solicitudes HTTP
 * que no empiecen con 'http'. Utiliza el servicio de configuración para obtener la URL base.
 */
export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  const configService = inject(ConfigService);
  const baseUrl = configService.getApiBaseUrl();

  if (!req.url.startsWith('http')) {
    const modifiedReq = req.clone({ url: `${baseUrl}${req.url}` });
    return next(modifiedReq);
  }

  return next(req);
};
