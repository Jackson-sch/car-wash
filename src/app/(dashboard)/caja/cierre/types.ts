export interface TurnoActivo {
  id: string;
  empleadoId: string;
  apertura: Date;
  montoInicial: string;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  pagos: { metodo: string; total: number }[];
  totalEgresos?: number;
}

export interface PagoReciente {
  id: string;
  monto: number;
  metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
  createdAt: Date;
  nroTicket: string | null;
  placa?: string | null;
  clienteNombre?: string | null;
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

export interface DenominacionItem {
  id: string;
  label: string;
  shortLabel: string;
  val: number;
  badgeClass?: string;
}

export const BILLETES: DenominacionItem[] = [
  { id: "b200", label: "Billete S/ 200.00", shortLabel: "S/ 200", val: 200, badgeClass: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { id: "b100", label: "Billete S/ 100.00", shortLabel: "S/ 100", val: 100, badgeClass: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { id: "b50", label: "Billete S/ 50.00", shortLabel: "S/ 50", val: 50, badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "b20", label: "Billete S/ 20.00", shortLabel: "S/ 20", val: 20, badgeClass: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { id: "b10", label: "Billete S/ 10.00", shortLabel: "S/ 10", val: 10, badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

export const MONEDAS: DenominacionItem[] = [
  { id: "m5", label: "Moneda S/ 5.00", shortLabel: "S/ 5.00", val: 5, badgeClass: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
  { id: "m2", label: "Moneda S/ 2.00", shortLabel: "S/ 2.00", val: 2, badgeClass: "text-amber-200 bg-amber-200/10 border-amber-200/20" },
  { id: "m1", label: "Moneda S/ 1.00", shortLabel: "S/ 1.00", val: 1, badgeClass: "text-zinc-300 bg-zinc-400/10 border-zinc-400/20" },
  { id: "m05", label: "Moneda S/ 0.50", shortLabel: "S/ 0.50", val: 0.5, badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "m02", label: "Moneda S/ 0.20", shortLabel: "S/ 0.20", val: 0.2, badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "m01", label: "Moneda S/ 0.10", shortLabel: "S/ 0.10", val: 0.1, badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

export const DENOMINACIONES = [...BILLETES, ...MONEDAS];
