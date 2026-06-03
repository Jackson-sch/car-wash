import { z } from 'zod';

export const abrirTurnoSchema = z.object({
  montoInicial: z.number().min(0, 'El monto no puede ser negativo'),
});

export const cobrarOrdenSchema = z.object({
  ordenId: z.string().uuid(),
  pagos:   z.array(z.object({
    metodo:     z.enum(['efectivo', 'tarjeta', 'yape', 'plin', 'transferencia', 'otro']),
    monto:      z.number().positive('El monto debe ser mayor a 0'),
    referencia: z.string().max(100).optional(),
  })).min(1),
});
