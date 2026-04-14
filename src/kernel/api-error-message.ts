/**
 * Extrae texto legible de respuestas de error del backend (formato SEA / DRF).
 * Incluye `non_field_errors`, errores por campo y mensajes anidados.
 */
function flattenDrfErrors(errors: unknown): string[] {
  const out: string[] = [];
  if (errors == null) return out;
  if (typeof errors === 'string') {
    out.push(errors);
    return out;
  }
  if (Array.isArray(errors)) {
    for (const item of errors) {
      out.push(...flattenDrfErrors(item));
    }
    return out;
  }
  if (typeof errors === 'object') {
    for (const v of Object.values(errors as Record<string, unknown>)) {
      out.push(...flattenDrfErrors(v));
    }
  }
  return out;
}

export function getApiErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Error en la solicitud';
  }
  const p = payload as Record<string, unknown>;

  const fromErrors = flattenDrfErrors(p.errors);
  if (fromErrors.length > 0) {
    return [...new Set(fromErrors)].join(' ');
  }

  if (typeof p.message === 'string' && p.message.trim()) {
    return p.message;
  }

  const err = p.error;
  if (err && typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string' && e.message.trim()) {
      return e.message;
    }
    const nested = flattenDrfErrors(e.details);
    if (nested.length > 0) return nested.join(' ');
  }

  return 'Error en la solicitud';
}
