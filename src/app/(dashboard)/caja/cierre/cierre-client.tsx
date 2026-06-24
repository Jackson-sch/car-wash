"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cerrarTurnoCaja, verificarAutorizacionSupervisor } from "@/lib/actions/caja";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

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

  // Estado de conciliación ciega
  const [reconciliado, setReconciliado] = useState(false);

  // Aprobación de supervisor
  const [supervisorAprobado, setSupervisorAprobado] = useState<{ nombre: string; email: string } | null>(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Credenciales de supervisor para el modal
  const [supEmail, setSupEmail] = useState("");
  const [supPassword, setSupPassword] = useState("");
  const [verifyingSup, setVerifyingSup] = useState(false);

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

  // Contadores reales ingresados por el cajero (inicializados en vacío para el arqueo a ciegas)
  const [actualCount, setActualCount] = useState<Record<string, string>>({
    tarjeta: "",
    yapePlin: "",
    transferencia: "",
  });

  const handleActualCountChange = (id: string, value: string) => {
    // Si ya reconcilió, forzamos volver a conciliar si edita montos para mantener la integridad
    if (reconciliado) {
      setReconciliado(false);
      setSupervisorAprobado(null);
    }
    setActualCount((prev) => ({ ...prev, [id]: value }));
  };

  const handleCantidadesChange = (id: string, value: string) => {
    if (reconciliado) {
      setReconciliado(false);
      setSupervisorAprobado(null);
    }
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

  // Realizar la conciliación (revelar los totales de sistema y calcular diferencias)
  const handleReconciliar = () => {
    // Validar que se hayan completado los campos
    if (!actualCount.tarjeta.trim() || !actualCount.yapePlin.trim() || !actualCount.transferencia.trim()) {
      toast.error("Por favor complete los montos contados de Tarjeta, Yape/Plin y Transferencia (coloque 0 si no hubo movimientos).");
      return;
    }
    setReconciliado(true);
    toast.success("Saldos calculados y conciliados contra el sistema.");
  };

  // Solicitar el modal de supervisor
  const handleSolicitarAprobacion = () => {
    setShowSupervisorModal(true);
  };

  // Validar credenciales de supervisor en el servidor
  const handleVerifySupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supEmail.trim() || !supPassword.trim()) {
      toast.error("Por favor complete los campos de email y contraseña.");
      return;
    }

    setVerifyingSup(true);
    try {
      const res = await verificarAutorizacionSupervisor(supEmail, supPassword);
      if (res.success && res.supervisor) {
        setSupervisorAprobado(res.supervisor);
        setShowSupervisorModal(false);
        toast.success(`Cierre descuadrado autorizado por: ${res.supervisor.nombre}`);
        setSupEmail("");
        setSupPassword("");
      } else {
        toast.error(res.error || "No se pudo verificar la autorización.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al validar autorización del supervisor.");
    } finally {
      setVerifyingSup(false);
    }
  };

  // Enviar el cierre de caja
  const handleFinalize = () => {
    if (!reconciliado) {
      toast.error("Por favor verifique y concilie los saldos primero.");
      return;
    }

    if (tieneDescuadre && !supervisorAprobado) {
      toast.error("Cierre bloqueado por descuadre. Requiere autorización de un Supervisor.");
      return;
    }

    if (tieneDescuadre && !obsCierre.trim()) {
      toast.error("Por favor ingresa una observación justificando el descuadre de caja.");
      return;
    }

    startTransition(async () => {
      const supervisorInfoStr = supervisorAprobado
        ? `\n\n[AUTORIZADO POR SUPERVISOR: ${supervisorAprobado.nombre} (${supervisorAprobado.email})]`
        : "";

      const finalObservaciones = `
[CORTE DE CAJA DETALLADO - ARQUEO A CIEGAS]
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
${obsCierre.trim() || "Sin observaciones adicionales."}${supervisorInfoStr}
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
            reconciliado={reconciliado}
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
            reconciliado={reconciliado}
            onReconciliar={handleReconciliar}
            tieneDescuadre={tieneDescuadre}
            totalDiferencia={totalDiferencia}
            obsCierre={obsCierre}
            isPending={isPending}
            onObsChange={setObsCierre}
            onFinalize={handleFinalize}
            supervisorAprobado={supervisorAprobado}
            onSolicitarAprobacion={handleSolicitarAprobacion}
          />
        </div>
      </div>

      {/* Modal de Autorización de Supervisor */}
      <Dialog open={showSupervisorModal} onOpenChange={setShowSupervisorModal}>
        <DialogContent className="bg-card border border-border rounded-2xl max-w-sm p-6 space-y-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-md font-extrabold text-foreground text-center">
                Autorización de Supervisor Requerida
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground text-center">
                Ingrese las credenciales de un supervisor o administrador para autorizar el cierre de caja con descuadre.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleVerifySupervisor} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="sup-email" className="text-[10px] font-bold text-zinc-650">
                Correo Electrónico
              </Label>
              <Input
                id="sup-email"
                type="email"
                placeholder="supervisor@carwash.com"
                value={supEmail}
                onChange={(e) => setSupEmail(e.target.value)}
                className="h-9 text-xs rounded-xl font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-pass" className="text-[10px] font-bold text-zinc-650">
                Contraseña
              </Label>
              <Input
                id="sup-pass"
                type="password"
                placeholder="••••••••"
                value={supPassword}
                onChange={(e) => setSupPassword(e.target.value)}
                className="h-9 text-xs rounded-xl font-medium"
                required
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSupEmail("");
                  setSupPassword("");
                }}
                className="flex-1 text-xs font-semibold h-9 rounded-xl border border-zinc-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={verifyingSup}
                className="flex-1 text-xs font-bold h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                {verifyingSup ? "Validando..." : "Autorizar Cierre"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
