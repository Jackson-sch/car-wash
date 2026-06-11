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
}
