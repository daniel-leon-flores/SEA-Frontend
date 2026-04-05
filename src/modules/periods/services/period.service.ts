import { PeriodController } from '../adapters/period.controller';

/**
 * Punto de entrada tipo *service* para el módulo de periodos.
 * Delega en {@link PeriodController} (misma capa que en el resto del proyecto: gateway + interactores).
 */
export const periodService = new PeriodController();
