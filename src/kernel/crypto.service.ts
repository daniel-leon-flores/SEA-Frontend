/**
 * Servicio de cifrado usando AES-GCM (Web Crypto API nativa)
 * Proporciona funciones para cifrar y descifrar datos sensibles de forma segura
 * Compatible con el backend que usa AES-GCM
 */

// Clave de cifrado - debe coincidir con la del backend
// En producción esta clave debe venir de variables de entorno
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export class CryptoService {
  /**
   * Deriva una clave criptográfica a partir de la clave string
   * @param keyString - String de la clave
   * @returns CryptoKey para usar con Web Crypto API
   */
  private static async deriveKey(keyString: string): Promise<CryptoKey> {
    // Convertir la clave string a bytes y ajustar a 32 bytes (256 bits)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyString);
    
    // Ajustar a 32 bytes
    const key32Bytes = new Uint8Array(32);
    for (let i = 0; i < Math.min(keyData.length, 32); i++) {
      key32Bytes[i] = keyData[i];
    }
    
    // Importar la clave para usar con AES-GCM
    return await crypto.subtle.importKey(
      'raw',
      key32Bytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Cifra un objeto de datos y retorna una cadena base64
   * @param data - Objeto con los datos a cifrar
   * @returns String cifrado en base64
   */
  static async encryptData(data: Record<string, any>): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(jsonString);
      
      // Generar nonce aleatorio de 12 bytes (96 bits, recomendado para GCM)
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      
      // Obtener la clave derivada
      const key = await this.deriveKey(ENCRYPTION_KEY);
      
      // Cifrar usando AES-GCM
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce
        },
        key,
        dataBytes
      );
      
      // Combinar nonce + ciphertext (GCM incluye el tag automáticamente)
      const encryptedBytes = new Uint8Array(encryptedData);
      const result = new Uint8Array(nonce.length + encryptedBytes.length);
      result.set(nonce, 0);
      result.set(encryptedBytes, nonce.length);
      
      // Convertir a base64
      return this.arrayBufferToBase64(result);
    } catch (error) {
      throw new Error('Error al cifrar datos: ' + error);
    }
  }

  /**
   * Descifra una cadena base64 y retorna el objeto original
   * @param encryptedString - String cifrado
   * @returns Objeto con los datos descifrados
   */
  static async decryptData(encryptedString: string): Promise<Record<string, any>> {
    try {
      // Decodificar de base64
      const encryptedBytes = this.base64ToArrayBuffer(encryptedString);
      
      // Extraer nonce (primeros 12 bytes)
      const nonce = encryptedBytes.slice(0, 12);
      
      // Extraer ciphertext (resto de los bytes)
      const ciphertext = encryptedBytes.slice(12);
      
      // Obtener la clave derivada
      const key = await this.deriveKey(ENCRYPTION_KEY);
      
      // Descifrar usando AES-GCM
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce
        },
        key,
        ciphertext
      );
      
      // Convertir bytes a string
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);
      
      // Parsear JSON
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Error al descifrar datos: ' + error);
    }
  }

  /**
   * Convierte ArrayBuffer a string base64
   * @param buffer - ArrayBuffer a convertir
   * @returns String en base64
   */
  private static arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  /**
   * Convierte string base64 a ArrayBuffer
   * @param base64 - String en base64
   * @returns Uint8Array
   */
  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

