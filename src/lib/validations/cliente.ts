import { z } from 'zod';

export const clienteSchema = z.object({
  nombre:    z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellido:  z.string().max(100).optional(),
  telefono:  z.string().regex(/^\+?[\d\s\-]{7,15}$/, 'Teléfono inválido').optional().or(z.literal('')),
  email:     z.string().email('Email inválido').optional().or(z.literal('')),
  tipoDoc:   z.enum(['DNI','RUC','CE','PASAPORTE']).optional(),
  nroDoc:    z.string().max(20).optional(),
  notas:     z.string().max(500).optional(),
});
