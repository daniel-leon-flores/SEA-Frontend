/**
 * Ofuscación ligera de IDs numéricos para URLs.
 * Convierte un ID numérico en un string opaco y viceversa.
 * NO es criptografía fuerte — solo evita que los IDs sean obvios en la barra de direcciones.
 */

const OFFSET = 7391;
const MULTIPLIER = 43;

/**
 * Codifica un ID numérico en un string seguro para URL.
 */
export function encodeId(id: number): string {
  const scrambled = (id * MULTIPLIER + OFFSET) ^ 0x5a3c;
  const raw = scrambled.toString(36);
  const b64 = btoa(raw).replaceAll('+', '-').replaceAll('/', '_');
  // Eliminamos el padding '=' sin regex para evitar backtracking (ReDoS).
  // btoa() produce a lo más 2 '=' de relleno, siempre al final.
  const padStart = b64.indexOf('=');
  return padStart === -1 ? b64 : b64.slice(0, padStart);
}

/**
 * Decodifica un string de URL de vuelta al ID numérico original.
 * Retorna Number.NaN si el valor es inválido.
 */
export function decodeId(encoded: string): number {
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
    const raw = atob(base64);
    const scrambled = Number.parseInt(raw, 36);
    if (Number.isNaN(scrambled)) return Number.NaN;
    return ((scrambled ^ 0x5a3c) - OFFSET) / MULTIPLIER;
  } catch {
    return Number.NaN;
  }
}
