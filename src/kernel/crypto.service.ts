/**
 * Servicio de cifrado usando AES (CryptoJS)
 * Proporciona funciones para cifrar y descifrar datos sensibles
 */

import CryptoJS from 'crypto-js';

// Clave de cifrado - debe coincidir con la del backend
// En producción esta clave debe venir de variables de entorno
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export class CryptoService {
  /**
   * Cifra un objeto de datos y retorna una cadena base64
   * @param data - Objeto con los datos a cifrar
   * @returns String cifrado en base64
   */
  static encryptData(data: Record<string, any>): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY);
    return encrypted.toString();
  }

  /**
   * Descifra una cadena base64 y retorna el objeto original
   * @param encryptedString - String cifrado
   * @returns Objeto con los datos descifrados
   */
  static decryptData(encryptedString: string): Record<string, any> {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedString, ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Error al descifrar datos: ' + error);
    }
  }
}
