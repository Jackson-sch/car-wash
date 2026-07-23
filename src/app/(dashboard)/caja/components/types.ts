export interface TransaccionDetallada {
  id: string;
  monto: number;
  metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
  createdAt: Date;
  nroTicket: string | null;
  servicios: string;
}

export interface TurnoActivo {
  id: string;
  empleadoId: string;
  apertura: Date;
  montoInicial: string;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  pagos: { metodo: string; total: number }[];
  ventasPorCategoria: { categoria: string; total: number }[];
  ventasPorHora: { hora: string; total: number }[];
  transaccionesDetalladas: TransaccionDetallada[];
  totalEgresos?: number;
  egresosList?: {
    id: string;
    monto: number;
    motivo: string;
    categoria: string;
    comprobanteNum: string | null;
    createdAt: Date;
    registradoPor: string | null;
  }[];
}

export interface TurnoHistorial {
  id: string;
  apertura: Date;
  cierre: Date | null;
  montoInicial: string;
  montoFinal: string | null;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
}

export interface MetodoPagoConciliacion {
  nombre: string;
  esperado: number;
  contado: number;
  diferencia: number;
}

export interface DesgloseEfectivoItem {
  denominacion: string;
  cantidad: number;
  total: number;
}

export interface ParsedCierreDetails {
  legacy: boolean;
  tipoCierre: string;
  fondoInicial: string;
  metodos: MetodoPagoConciliacion[];
  desglose: DesgloseEfectivoItem[];
  observaciones: string;
  supervisor: string | null;
}

