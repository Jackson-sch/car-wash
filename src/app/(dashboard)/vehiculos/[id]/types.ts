export interface VehiculoData {
  id: string;
  placa: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  notas: string | null;
  activo: boolean | null;
  createdAt: Date | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
}

export interface OrdenItem {
  id: string;
  nroTicket: string | null;
  estado: string;
  total: string | null;
  prioridad: number | null;
  notas: string | null;
  createdAt: Date | null;
  servicios: string;
}

export interface DetailData {
  vehiculo: VehiculoData;
  ordenes: OrdenItem[];
}

export const TIPO_LABELS: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pick-up",
  moto: "Moto",
  camion: "Camión",
  furgon: "Furgón",
  otro: "Otro",
};
