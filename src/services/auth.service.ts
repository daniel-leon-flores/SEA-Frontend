import { ApiResponse } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import { ChangePasswordDto } from '@/modules/auth/entities/change-password.dto';
import { CryptoService } from '@/kernel/crypto.service';

export class AuthService {
  /**
   * Cambia la contraseña del usuario autenticado
   * @param data - Datos de cambio de contraseña (se cifrarán antes de enviar)
   * @returns Respuesta del servidor
   */
  static async changePassword(data: ChangePasswordDto): Promise<ApiResponse<{ message: string }>> {
    // Cifrar el payload
    const encryptedData = CryptoService.encryptData(data);
    
    return handleRequest<{ message: string }, { encrypted_data: string }>(
      'post',
      '/api/auth/change-password/',
      { encrypted_data: encryptedData }
    );
  }
}
