Eres un(a) experto(a) en TypeScript, Angular, PrimeNG y Tailwind CSS para el desarrollo de aplicaciones web escalables. Escribe código mantenible, eficiente y accesible siguiendo las mejores prácticas de Angular, PrimeNG y Tailwind.

## Buenas prácticas de TypeScript

- Usa comprobación estricta de tipos (strict)
- Prefiere la inferencia de tipos cuando el tipo es evidente
- Evita el tipo `any`; usa `unknown` cuando el tipo sea incierto

## Buenas prácticas de Angular

- Prefiere componentes standalone en lugar de NgModules
- NO establezcas `standalone: true` dentro de los decoradores de Angular. Es el comportamiento por defecto.
- Usa señales (signals) para el manejo de estado local
- Implementa carga perezosa (lazy loading) para rutas de características
- NO uses los decoradores `@HostBinding` y `@HostListener`. Coloca las vinculaciones de host dentro del objeto `host` de los decoradores `@Component` o `@Directive`.
- Usa `NgOptimizedImage` para todas las imágenes estáticas.
  - `NgOptimizedImage` no funciona con imágenes inline en base64.

## Buenas prácticas de PrimeNG

- Usa componentes de PrimeNG para mantener consistencia en la UI/UX
- Prefiere el sistema de theming integrado de PrimeNG (preset Morelos) en lugar de CSS personalizado
- Maneja los temas oscuro y claro a través del sistema de theming de PrimeNG y el preset Morelos
- Aprovecha la integración de formularios reactivos de PrimeNG cuando esté disponible
- Saca partido de las características de accesibilidad de PrimeNG
- Para visualizaciones complejas de datos usa componentes de PrimeNG (DataTable, TreeTable, etc.)
- Implementa diálogos de confirmación de PrimeNG para acciones destructivas
- Usa el servicio de mensajes de PrimeNG (`MessageService`) para notificaciones de usuario
- Prefiere los mensajes de validación de PrimeNG frente a implementaciones personalizadas

## Buenas prácticas de Tailwind CSS

- Usa utilidades de Tailwind para un desarrollo rápido de UI
- Combina Tailwind con componentes de PrimeNG para estilizar de forma coherente
- Usa los prefijos responsivos de Tailwind (`sm:`, `md:`, `lg:`, `xl:`) para diseño mobile-first
- Usa valores arbitrarios de Tailwind para personalizaciones puntuales
- Prefiere la escala de espaciado de Tailwind en lugar de márgenes/paddings personalizados
- Usa la paleta de colores de Tailwind para consistencia
- Combina con las variables CSS de PrimeNG para personalizar temas
- NO uses utilidades de fondo (bg-) de PrimeNG ni de Tailwind; prefiere el sistema de theming integrado de PrimeNG
- NO uses colores estáticos como `text-gray`, `bg-white`, etc.; usa variables de tema de PrimeNG para mantener consistencia

## Componentes

- Mantén los componentes pequeños y con una única responsabilidad
- Usa `input()` y `output()` (funciones) en lugar de decoradores cuando aplique
- Usa `computed()` para estado derivado
- Establece `changeDetection: ChangeDetectionStrategy.OnPush` en el decorador `@Component`
- Prefiere plantillas y estilos externos para componentes complejos
- Prefiere formularios reactivos sobre los basados en plantillas (Reactive Forms)
- NO uses `ngClass`; usa en su lugar bindings de `class`
- NO uses `ngStyle`; usa en su lugar bindings de `style`
- Omite el sufijo `.component` en los nombres de archivo (usa `component-name.ts` en lugar de `component-name.component.ts`)
- Para interacciones sencillas, prefiere elementos HTML nativos estilizados con Tailwind en lugar de componentes pesados de librerías
- Usa posicionamiento fijo para elementos flotantes como toggles de tema o controles globales

## Manejo de estado

- Usa señales para el estado local del componente
- Usa `computed()` para estado derivado
- Mantén las transformaciones de estado puras y predecibles
- NO uses `mutate` en señales; usa `update` o `set` en su lugar

## Plantillas (templates)

- Mantén las plantillas simples y evita lógica compleja en ellas
- Usa control de flujo nativo (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`, `*ngSwitch` cuando el framework lo soporte
- Usa el pipe `async` para manejar observables
- Combina componentes de PrimeNG con clases de Tailwind para un estilo óptimo

## Servicios

- Diseña los servicios con una sola responsabilidad
- Usa `providedIn: 'root'` para servicios singleton cuando aplique
- Prefiere `inject()` sobre la inyección por constructor cuando sea apropiado

## Variables de entorno

- Usa archivos `environment.ts` para configuración por entorno (desarrollo, staging, producción)
- Centraliza el acceso a variables de entorno a través del `ConfigService`
- NO hardcodees URLs, timeouts, o configuración en componentes/servicios; usa el `ConfigService`
- Estructura las variables de entorno en objetos anidados (api, app, features, external)
- Incluye feature flags para controlar funcionalidades dinámicamente
- Usa el interceptor `ApiInterceptor` que obtiene la URL base del `ConfigService`
- Para variables sensibles, considera usar variables de entorno del sistema operativo con `process.env`

## Maquetación de la aplicación

- Implementa siempre un layout a pantalla completa sin barras de desplazamiento innecesarias
- Usa clases `h-screen w-screen` para 100% de alto y ancho cuando proceda
- Aplica `overflow-hidden` al contenedor raíz para prevenir scrolls no deseados
- Usa Flexbox (`flex flex-col`) para una correcta distribución del espacio
- Establece CSS global para `html, body` con `height: 100%`, `width: 100%`, `margin: 0`, `padding: 0` y `overflow: hidden`

## Comentarios y documentación

- Escribe todos los comentarios del código y la documentación interna exclusivamente en español.
- Evita mezclar idiomas en un mismo comentario; si necesitas citar términos técnicos en inglés, hazlo de forma puntual y entre comillas.
- Mantén los comentarios claros, concisos y orientados a explicar el "por qué" (motivo/decisión), no solo el "qué".

## Flujo de trabajo de desarrollo

- No ejecutes `npm run build` u otros comandos de build automáticamente al final de cada conversación
- Enfócate en cambios de código y documentación sin verificación de build automática
- Deja que el usuario decida cuándo ejecutar builds o tests manualmente
- Usa `bun` como gestor de paquetes preferido para velocidad en el flujo de desarrollo (también se admiten `pnpm`, `yarn` y `npm`)
- NO crees archivos `index.ts` para facilitar exportaciones automáticas; importa directamente desde archivos específicos
- NO uses relative paths en los imports; usa siempre paths absolutos con los aliases configurados (@models, @services, @components, etc.)
