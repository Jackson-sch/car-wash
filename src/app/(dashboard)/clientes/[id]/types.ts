export interface ClienteData {
  id: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  tipoDoc: string | null;
  nroDoc: string | null;
  notas: string | null;
  activo: boolean | null;
  totalPuntos: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface VehiculoItem {
  id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  tipo: string | null;
  anio: number | null;
  activo: boolean | null;
}

export interface PuntosLogItem {
  id: string;
  puntos: number;
  tipo: "ganado" | "canjeado" | "ajuste";
  descripcion: string | null;
  createdAt: Date | null;
}

export interface OrdenItem {
  id: string;
  nroTicket: string | null;
  estado: string;
  total: string | null;
  subtotal: string | null;
  igv: string | null;
  descuento: string | null;
  createdAt: Date | null;
  vehiculoId: string | null;
  placa: string;
  marca: string | null;
  modelo: string | null;
  tipo: string | null;
}

export interface ClienteStatsData {
  totalGastado: number;
  totalOrdenes: number;
  ordenesCompletadas: number;
  totalVehiculos: number;
  totalPuntos: number;
  valorPuntosSoles: number;
}

export interface ClienteDetailData {
  cliente: ClienteData;
  vehiculos: VehiculoItem[];
  puntos: PuntosLogItem[];
  ordenes: OrdenItem[];
  stats: ClienteStatsData;
}
