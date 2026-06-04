import { z } from 'zod';

export const crearOrdenSchema = z.object({
  vehiculoId:  z.string().uuid('Vehículo requerido'),
  empleadoId:  z.string().uuid().optional(),
  servicios:   z.array(z.object({
    servicioId: z.string().uuid(),
    cantidad:   z.number().int().min(1).max(10),
  })).min(1, 'Debe seleccionar al menos un servicio'),
  descuento:   z.number().min(0).max(100).default(0),
  notas:       z.string().max(300).optional(),
});
