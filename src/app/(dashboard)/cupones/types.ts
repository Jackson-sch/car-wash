export interface ServicioOption {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoriaNombre: string | null;
}

export interface CuponUsoItem {
  id?: string;
  clienteId?: string | null;
  ordenId?: string | null;
  createdAt?: Date | null;
}

export interface CuponServicioItem {
  servicioId?: string | null;
  servicio?: {
    id: string;
    nombre?: string;
  } | null;
}

export interface CuponItem {
  id: string;
  codigo: string;
  activo: boolean;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  compraMinima: number | null;
  limiteTotal: number | null;
  limitePorCliente: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  createdAt: Date;
  usos?: CuponUsoItem[];
  servicios?: CuponServicioItem[];
}

export type CuponFilterType =
  | "todos"
  | "activos"
  | "porcentaje"
  | "fijo"
  | "agotados_expirados";
