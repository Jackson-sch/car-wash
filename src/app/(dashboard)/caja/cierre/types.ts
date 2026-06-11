export interface TurnoActivo {
  id: string;
  empleadoId: string;
  apertura: Date;
  montoInicial: string;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  pagos: { metodo: string; total: number }[];
}

export interface PagoReciente {
  id: string;
  monto: number;
  metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
  createdAt: Date;
  nroTicket: string | null;
}

export interface SystemStats {
  openingCash: number;
  efectivoVentas: number;
  tarjetaVentas: number;
  yapePlinVentas: number;
  transferenciasVentas: number;
  expectedEfectivo: number;
}
