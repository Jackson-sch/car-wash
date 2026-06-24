export interface KPIStats {
  totalVentas: number;
  ticketPromedio: number;
  ordenesCompletadas: number;
}

export interface VentaDiaria {
  fecha: string;
  ventas: number;
}

export interface PagoMetodo {
  name: string;
  value: number;
}

export interface ServicioTop {
  name: string;
  cantidad: number;
  total: number;
}

export interface HoraPico {
  hora: string;
  cantidad: number;
  prediccion: number;
}

export interface ReportData {
  kpis: KPIStats;
  ventasDiarias: VentaDiaria[];
  pagosMetodo: PagoMetodo[];
  serviciosTop: ServicioTop[];
  horasPico: HoraPico[];
}
