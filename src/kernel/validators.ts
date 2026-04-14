/**
 * Centralized validation rules and sanitization helpers.
 * Compatible with Vuetify v-text-field :rules prop.
 */

// ─── Sanitization ───────────────────────────────────────────────────────────

/**
 * Strips HTML tags to prevent XSS when displaying user input.
 * Does NOT alter the v-model — use before sending data to backend.
 */
export function sanitizeText(value: string): string {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
}

/**
 * Strips characters that are not expected in a person name.
 */
export function sanitizeName(value: string): string {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, '').replace(/[<>{}[\]\\]/g, '');
}

// ─── Validation Rules (Vuetify-compatible) ──────────────────────────────────

export const rules = {
  /** Field must not be empty / null / undefined */
  required: (v: unknown): true | string =>
    (v !== null && v !== undefined && String(v).trim() !== '') || 'Campo requerido',

  /** Valid email (safe regex, no catastrophic backtracking) */
  email: (v: string): true | string =>
    !v || /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/.test(v) || 'Correo electrónico inválido',

  /** Minimum string length */
  minLength:
    (min: number) =>
    (v: string): true | string =>
      !v || v.length >= min || `Mínimo ${min} caracteres`,

  /** Maximum string length */
  maxLength:
    (max: number) =>
    (v: string): true | string =>
      !v || v.length <= max || `Máximo ${max} caracteres`,

  /** Only letters, spaces, accents, hyphens — for names */
  nameChars: (v: string): true | string =>
    !v || /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/.test(v) || 'Solo se permiten letras, espacios, acentos y guiones',

  /** Alphanumeric + hyphens — for matrícula, codes */
  alphanumeric: (v: string): true | string =>
    !v || /^[a-zA-Z0-9-]+$/.test(v) || 'Solo letras, números y guiones',

  /** Integer in range */
  intRange:
    (min: number, max: number) =>
    (v: unknown): true | string => {
      if (v === null || v === undefined || v === '') return true;
      const n = Number(v);
      if (!Number.isInteger(n)) return 'Debe ser un número entero';
      if (n < min || n > max) return `Debe estar entre ${min} y ${max}`;
      return true;
    },

  /** Decimal number in range */
  numberRange:
    (min: number, max: number) =>
    (v: unknown): true | string => {
      if (v === null || v === undefined || v === '') return true;
      const n = Number(v);
      if (Number.isNaN(n)) return 'Debe ser un número válido';
      if (n < min || n > max) return `Debe estar entre ${min} y ${max}`;
      return true;
    },

  /** Positive integer (> 0) */
  positiveInt: (v: unknown): true | string => {
    if (v === null || v === undefined || v === '') return true;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1) return 'Debe ser un entero positivo';
    return true;
  },

  /** No HTML tags */
  noHtml: (v: string): true | string =>
    !v || !/<[^>]*>/.test(v) || 'No se permiten etiquetas HTML',

  /** No script-like patterns */
  noScript: (v: string): true | string =>
    !v ||
    !/(<script|javascript:|on\w+=|eval\(|document\.|window\.)/i.test(v) ||
    'Contenido no permitido',

  /** Valid year */
  year:
    (minYear = 1900, maxYear = new Date().getFullYear()) =>
    (v: unknown): true | string => {
      if (v === null || v === undefined || v === '') return true;
      const n = Number(v);
      if (!Number.isInteger(n)) return 'Debe ser un año válido';
      if (n < minYear || n > maxYear) return `El año debe estar entre ${minYear} y ${maxYear}`;
      return true;
    },

  /** Password strength: min 8 chars */
  passwordMin: (v: string): true | string =>
    !v || v.length >= 8 || 'Mínimo 8 caracteres',

  /** Passwords match */
  passwordMatch:
    (compareTo: () => string) =>
    (v: string): true | string =>
      v === compareTo() || 'Las contraseñas no coinciden',

  /** Single uppercase letter (for group names) */
  singleLetter: (v: string): true | string =>
    !v || /^[A-Za-z]$/.test(v.trim()) || 'Debe ser una sola letra',

  /** Valid URL (optional) */
  optionalUrl: (v: string): true | string =>
    !v || /^https?:\/\/.+/.test(v) || 'Debe ser una URL válida (https://...)',
};
