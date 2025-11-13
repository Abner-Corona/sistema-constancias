/**
 * Utility functions for the application
 */

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Convierte un objeto a FormData de forma genérica
 * @param obj - El objeto a convertir
 * @returns FormData con los datos del objeto
 */
export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        // Si es un array, agregar cada elemento con el mismo nombre de campo
        value.forEach((item, index) => {
          if (item !== null && item !== undefined) {
            formData.append(`${key}[${index}]`, item.toString());
          }
        });
      } else if (typeof value === 'boolean') {
        // Convertir booleanos a string
        formData.append(key, value.toString());
      } else if (typeof value === 'number') {
        // Convertir números a string
        formData.append(key, value.toString());
      } else if (value instanceof File) {
        // Si es un archivo, agregarlo directamente
        formData.append(key, value);
      } else {
        // Para strings y otros tipos, convertir a string
        formData.append(key, value.toString());
      }
    }
  }

  return formData;
}
