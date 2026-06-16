"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cerrarTurnoCaja } from "@/lib/actions/caja";

// Import Types
import type { TurnoActivo, PagoReciente } from "./types";

// Import Components
import { CierreHeader } from "./components/CierreHeader";
import { TurnoInfoCard } from "./components/TurnoInfoCard";
import { TurnoResumenCard } from "./components/TurnoResumenCard";
import { ConciliacionTable } from "./components/ConciliacionTable";
import { ArqueoEfectivo, DENOMINACIONES } from "./components/ArqueoEfectivo";
import { PagosRecientesList } from "./components/PagosRecientesList";
import { CierreAlerts } from "./components/CierreAlerts";

interface CierreCajaClientProps {
  turno: TurnoActivo;
  resumen: {
    totalServicios: number;
    ventasBrutas: number;
    descuentos: number;
    ingresosNetos: number;
  };
  pagosRecientes: PagoReciente[];
}

export function CierreCajaClient({
  turno,
  resumen,
  pagosRecientes,
}: CierreCajaClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado del arqueo de denominaciones
  const [cantidades, setCantidades] = useState<Record<string, string>>({});

  // Estado para observaciones / justificación
  const [obsCierre, setObsCierre] = useState("");

  // Estadísticas esperadas por sistema
  const systemStats = useMemo(() => {
    const openingCash = parseFloat(turno.montoInicial) || 0;
    const efectivoVentas =
      turno.pagos.find((p) => p.metodo === "efectivo")?.total || 0;
    const tarjetaVentas =
      turno.pagos.find((p) => p.metodo === "tarjeta")?.total || 0;
    const yapeVentas = turno.pagos.find((p) => p.metodo === "yape")?.total || 0;
    const plinVentas = turno.pagos.find((p) => p.metodo === "plin")?.total || 0;
    const yapePlinVentas = yapeVentas + plinVentas;
    const transferenciasVentas =
      turno.pagos.find((p) => p.metodo === "transferencia")?.total || 0;

    const expectedEfectivo = openingCash + efectivoVentas;

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas,
      transferenciasVentas,
      expectedEfectivo,
    };
  }, [turno]);

  // Contadores reales para métodos que no son efectivo (Tarjetas, billeteras)
  const [actualCount, setActualCount] = useState<Record<string, string>>({
    tarjeta: systemStats.tarjetaVentas.toString(),
    yapePlin: systemStats.yapePlinVentas.toString(),
    transferencia: systemStats.transferenciasVentas.toString(),
  });

  const handleActualCountChange = (id: string, value: string) => {
    setActualCount((prev) => ({ ...prev, [id]: value }));
  };

  const handleCantidadesChange = (id: string, value: string) => {
    setCantidades((prev) => ({ ...prev, [id]: value }));
  };

  // Calcular el total de efectivo contado físicamente
  const totalEfectivoContado = useMemo(() => {
    let sum = 0;
    DENOMINACIONES.forEach((d) => {
      const cant = parseInt(cantidades[d.id] || "0") || 0;
      sum += cant * d.val;
    });
    return sum;
  }, [cantidades]);

  // Totales generales esperados y reales
  const expectedTotals = useMemo(() => {
    return (
      systemStats.expectedEfectivo +
      systemStats.tarjetaVentas +
      systemStats.yapePlinVentas +
      systemStats.transferenciasVentas
    );
  }, [systemStats]);

  const actualTotals = useMemo(() => {
    const cash = totalEfectivoContado;
    const card = parseFloat(actualCount.tarjeta) || 0;
    const eWallet = parseFloat(actualCount.yapePlin) || 0;
    const transfer = parseFloat(actualCount.transferencia) || 0;
    return cash + card + eWallet + transfer;
  }, [totalEfectivoContado, actualCount]);

  const totalDiferencia = actualTotals - expectedTotals;
  const cashDiferencia = totalEfectivoContado - systemStats.expectedEfectivo;
  const tarjetaDiferencia =
    (parseFloat(actualCount.tarjeta) || 0) - systemStats.tarjetaVentas;
  const yapePlinDiferencia =
    (parseFloat(actualCount.yapePlin) || 0) - systemStats.yapePlinVentas;
  const transferDiferencia =
    (parseFloat(actualCount.transferencia) || 0) -
    systemStats.transferenciasVentas;

  const tieneDescuadre = Math.abs(totalDiferencia) > 0.01;

  // Enviar el cierre
  const handleFinalize = () => {
    if (tieneDescuadre && !obsCierre.trim()) {
      toast.error(
        "Por favor ingresa una observación justificando el descuadre de caja.",
      );
      return;
    }

    startTransition(async () => {
      const finalObservaciones = `
[CORTE DE CAJA DETALLADO]
- Fondo Inicial: S/ ${systemStats.openingCash.toFixed(2)}
- Efectivo Esperado: S/ ${systemStats.expectedEfectivo.toFixed(2)} | Contado: S/ ${totalEfectivoContado.toFixed(2)} (Dif: S/ ${cashDiferencia.toFixed(2)})
- Tarjeta Esperado: S/ ${systemStats.tarjetaVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.tarjeta) || 0).toFixed(2)} (Dif: S/ ${tarjetaDiferencia.toFixed(2)})
- Yape/Plin Esperado: S/ ${systemStats.yapePlinVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.yapePlin) || 0).toFixed(2)} (Dif: S/ ${yapePlinDiferencia.toFixed(2)})
- Transferencias Esperado: S/ ${systemStats.transferenciasVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.transferencia) || 0).toFixed(2)} (Dif: S/ ${transferDiferencia.toFixed(2)})

[DESGLOSE DE EFECTIVO]
${DENOMINACIONES.map((d) => {
  const cant = parseInt(cantidades[d.id] || "0") || 0;
  return cant > 0
    ? "  * " + d.label + ": " + cant + " u. = S/ " + (cant * d.val).toFixed(2)
    : null;
})
  .filter(Boolean)
  .join("\n")}

[OBSERVACIONES GENERALES]
${obsCierre.trim() || "Sin observaciones adicionales."}
`.trim();

      const res = await cerrarTurnoCaja({
        montoFinal: totalEfectivoContado.toString(),
        observaciones: finalObservaciones,
      });

      if (res.success) {
        toast.success("Turno de caja cerrado correctamente");
        router.push("/caja");
        router.refresh();
      } else {
        toast.error(res.error || "Ocurrió un error al cerrar la caja");
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      <CierreHeader
        turno={turno}
        systemStats={systemStats}
        isPending={isPending}
        onFinalize={handleFinalize}
        onPrint={handlePrint}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Conciliación & Desglose) */}
        <div className="lg:col-span-8 space-y-6">
          <TurnoInfoCard turno={turno} systemStats={systemStats} />

          <ConciliacionTable
            systemStats={systemStats}
            actualCount={actualCount}
            totalEfectivoContado={totalEfectivoContado}
            onActualCountChange={handleActualCountChange}
            cashDiferencia={cashDiferencia}
            tarjetaDiferencia={tarjetaDiferencia}
            yapePlinDiferencia={yapePlinDiferencia}
            transferDiferencia={transferDiferencia}
            expectedTotals={expectedTotals}
            actualTotals={actualTotals}
            totalDiferencia={totalDiferencia}
          />

          <ArqueoEfectivo
            cantidades={cantidades}
            onCantidadesChange={handleCantidadesChange}
            totalEfectivoContado={totalEfectivoContado}
          />
        </div>

        {/* Right Column (Estadísticas y Cierre) */}
        <div className="lg:col-span-4 space-y-6">
          <TurnoResumenCard resumen={resumen} />
          <PagosRecientesList pagos={pagosRecientes} />

          <CierreAlerts
            tieneDescuadre={tieneDescuadre}
            totalDiferencia={totalDiferencia}
            obsCierre={obsCierre}
            isPending={isPending}
            onObsChange={setObsCierre}
            onFinalize={handleFinalize}
          />
        </div>
      </div>
    </div>
  );
}
