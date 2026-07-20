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
  totalEgresos: number;
  expectedEfectivo: number;
}

export const BILLETES = [
  { id: "b200", label: "Billete S/ 200.00", val: 200 },
  { id: "b100", label: "Billete S/ 100.00", val: 100 },
  { id: "b50", label: "Billete S/ 50.00", val: 50 },
  { id: "b20", label: "Billete S/ 20.00", val: 20 },
  { id: "b10", label: "Billete S/ 10.00", val: 10 },
];

export const MONEDAS = [
  { id: "m5", label: "Moneda S/ 5.00", val: 5 },
  { id: "m2", label: "Moneda S/ 2.00", val: 2 },
  { id: "m1", label: "Moneda S/ 1.00", val: 1 },
  { id: "m05", label: "Moneda S/ 0.50", val: 0.5 },
  { id: "m02", label: "Moneda S/ 0.20", val: 0.2 },
  { id: "m01", label: "Moneda S/ 0.10", val: 0.1 },
];

export const DENOMINACIONES = [...BILLETES, ...MONEDAS];
