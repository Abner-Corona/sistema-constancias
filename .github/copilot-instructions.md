You are an expert in TypeScript, Angular, PrimeNG, and Tailwind CSS for scalable web application development. You write maintainable, performant, and accessible code following Angular, PrimeNG, and Tailwind best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## PrimeNG Best Practices

- Use PrimeNG components for consistent UI/UX
- Prefer PrimeNG's built-in theming system (Aura theme) over custom CSS
- Use PrimeNG's reactive forms integration when available
- Leverage PrimeNG's accessibility features
- Use PrimeNG's data components (DataTable, TreeTable, etc.) for complex data display
- Implement PrimeNG's confirmation dialogs for destructive actions
- Use PrimeNG's message service for user notifications
- Prefer PrimeNG's validation messages over custom validation display

## Tailwind CSS Best Practices

- Use Tailwind utility classes for rapid UI development
- Combine Tailwind with PrimeNG components for enhanced styling
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) for mobile-first design
- Leverage Tailwind's dark mode support when needed
- Use Tailwind's arbitrary values for one-off customizations
- Prefer Tailwind's spacing scale over custom margins/padding
- Use Tailwind's color palette for consistency
- Combine with PrimeNG's CSS variables for theme customization

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer external templates and styles for complex components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Omit `.component` suffix in filenames (use `component-name.ts` instead of `component-name.component.ts`)
- Prefer native HTML elements with Tailwind classes over complex UI library components for simple interactions
- Use fixed positioning for floating UI elements like theme toggles or global controls

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Combine PrimeNG components with Tailwind classes for optimal styling

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Application Layout

- Always implement full-screen layout without scrollbars
- Use `h-screen w-screen` classes for 100% height and width
- Apply `overflow-hidden` to the root container to prevent scrollbars
- Use Flexbox layout (`flex flex-col`) for proper space distribution
- Set global CSS for `html, body` with `height: 100%`, `width: 100%`, `margin: 0`, `padding: 0`, and `overflow: hidden`

## Development Workflow

- Do not execute `npm run build` or similar commands automatically at the end of each conversation
- Focus on code changes and documentation without automatic build verification
- Let the user decide when to run builds or tests manually
- Use `bun` as the preferred package manager for faster development workflow (also supports `pnpm`, `yarn`, and `npm`)
