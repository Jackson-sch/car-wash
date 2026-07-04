import { describe, it, expect } from "vitest";
import { calculateCashCloseDetail, calculateCommissions, PagoSimulado, ServicioSimulado } from "../lib/utils/calculator";

describe("Cálculos de Cierre de Caja", () => {
  it("debería calcular el cuadre de caja esperado correctamente", () => {
    const montoInicial = 150.00;
    const pagos: PagoSimulado[] = [
      { monto: 50.00, metodo: "efectivo" },
      { monto: 35.00, metodo: "efectivo" },
      { monto: 80.00, metodo: "tarjeta" },
      { monto: 45.00, metodo: "yape" },
      { monto: 20.00, metodo: "plin" },
    ];

    const result = calculateCashCloseDetail(montoInicial, pagos);

    expect(result.ventasBrutas).toBe(230.00); // 50+35+80+45+20
    expect(result.totalEfectivo).toBe(85.00); // 50+35
    expect(result.totalElectronico).toBe(145.00); // 80+45+20
    expect(result.montoEsperadoCaja).toBe(235.00); // 150 (inicial) + 85 (efectivo)
  });

  it("debería retornar 0 si no hay pagos", () => {
    const result = calculateCashCloseDetail(100.00, []);
    expect(result.ventasBrutas).toBe(0);
    expect(result.totalEfectivo).toBe(0);
    expect(result.totalElectronico).toBe(0);
    expect(result.montoEsperadoCaja).toBe(100.00);
  });
});

describe("Cálculos de Comisiones de Lavadores", () => {
  it("debería calcular el total acumulado de comisiones", () => {
    const servicios: ServicioSimulado[] = [
      { precio: 40.00, comisionPorcentaje: 30 }, // 12.00
      { precio: 60.00, comisionPorcentaje: 25 }, // 15.00
      { precio: 120.00, comisionPorcentaje: 10 }, // 12.00
    ];

    const totalComision = calculateCommissions(servicios);
    expect(totalComision).toBe(39.00);
  });

  it("debería retornar 0 si no hay servicios asignados", () => {
    expect(calculateCommissions([])).toBe(0);
  });
});
