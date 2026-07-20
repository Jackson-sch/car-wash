export interface SucursalItem {
  id: string;
  empresaId: string | null;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logoUrl: string | null;
  config: unknown;
  activa: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface SucursalFormData {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  ruc: string;
}
