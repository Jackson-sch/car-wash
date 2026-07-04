export interface PagoSimulado {
  monto: number;
  metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
}

export interface ServicioSimulado {
  precio: number;
  comisionPorcentaje: number; // e.g. 30 para 30%
}

/**
 * Calcula los detalles de arqueo de caja esperado.
 */
export function calculateCashCloseDetail(montoInicial: number, pagos: PagoSimulado[]) {
  const ventasBrutas = pagos.reduce((sum, p) => sum + p.monto, 0);
  const totalEfectivo = pagos
    .filter((p) => p.metodo === "efectivo")
    .reduce((sum, p) => sum + p.monto, 0);
  const totalElectronico = pagos
    .filter((p) => p.metodo !== "efectivo")
    .reduce((sum, p) => sum + p.monto, 0);
  const montoEsperadoCaja = montoInicial + totalEfectivo;

  return {
    ventasBrutas: parseFloat(ventasBrutas.toFixed(2)),
    totalEfectivo: parseFloat(totalEfectivo.toFixed(2)),
    totalElectronico: parseFloat(totalElectronico.toFixed(2)),
    montoEsperadoCaja: parseFloat(montoEsperadoCaja.toFixed(2)),
  };
}

/**
 * Calcula las comisiones devengadas por los lavadores.
 */
export function calculateCommissions(servicios: ServicioSimulado[]) {
  const total = servicios.reduce((sum, s) => {
    const comision = s.precio * (s.comisionPorcentaje / 100);
    return sum + comision;
  }, 0);
  return parseFloat(total.toFixed(2));
}
