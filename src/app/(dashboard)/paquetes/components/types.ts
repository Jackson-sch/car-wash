export interface PaqueteItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  activo: boolean | null;
  createdAt: Date | null;
  servicios: { id: string; nombre: string }[];
}

export interface ServicioOption {
  id: string;
  nombre: string;
  precio: string;
}

export interface PaqueteFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  servicioIds: string[];
}
