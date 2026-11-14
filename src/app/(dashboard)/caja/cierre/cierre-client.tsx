"use client";

import type { TurnoActivo, PagoReciente } from "./types";
import { CierreHeader } from "./components/CierreHeader";
import { TurnoInfoCard } from "./components/TurnoInfoCard";
import { TurnoResumenCard } from "./components/TurnoResumenCard";
import { ConciliacionTable } from "./components/ConciliacionTable";
import { ArqueoEfectivo } from "./components/ArqueoEfectivo";
import { PagosRecientesList } from "./components/PagosRecientesList";
import { CierreAlerts } from "./components/CierreAlerts";
import { CierreGuideBox } from "./components/CierreGuideBox";
import { SupervisorAuthModal } from "./components/SupervisorAuthModal";
import { ConfirmCloseModal } from "./components/ConfirmCloseModal";
import { useCierreCaja } from "./hooks/useCierreCaja";
import { Lock } from "lucide-react";

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
  const c = useCierreCaja(turno);
  // Los montos detallados de facturación y cobros NUNCA se revelan al cajero en el arqueo a ciegas.
  // Solo se desbloquean si un Supervisor audita la caja con sus credenciales.
  const shouldRevealSupervisorAudit = !!c.supervisorAprobado;

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 print:p-0 print:space-y-4 text-foreground">
      <CierreHeader
        turno={turno}
        systemStats={c.systemStats}
        onPrint={c.handlePrint}
        reconciliado={c.reconciliado}
      />

      <TurnoInfoCard
        turno={turno}
        systemStats={c.systemStats}
        totalServicios={resumen.totalServicios}
      />

      <CierreGuideBox />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Columna Izquierda: Pasos 1 y 2 (Arqueo y Conciliación) */}
        <div className="lg:col-span-8 space-y-6 print:!w-full print:!max-w-full">
          <ArqueoEfectivo
            cantidades={c.cantidades}
            onCantidadesChange={c.handleCantidadesChange}
            totalEfectivoContado={c.totalEfectivoContado}
          />

          <ConciliacionTable
            systemStats={c.systemStats}
            actualCount={c.actualCount}
            totalEfectivoContado={c.totalEfectivoContado}
            onActualCountChange={c.handleActualCountChange}
            cashDiferencia={c.cashDiferencia}
            tarjetaDiferencia={c.tarjetaDiferencia}
            yapePlinDiferencia={c.yapePlinDiferencia}
            transferDiferencia={c.transferDiferencia}
            expectedTotals={c.expectedTotals}
            actualTotals={c.actualTotals}
            totalDiferencia={c.totalDiferencia}
            reconciliado={c.reconciliado}
            tieneDescuadre={c.tieneDescuadre}
            supervisorAprobado={c.supervisorAprobado}
          />
        </div>

        {/* Columna Derecha: Paso 3 (Verificación y Cierre), Resumen y Cobros */}
        <div className="lg:col-span-4 space-y-6 print:!w-full print:!max-w-full">
          <CierreAlerts
            reconciliado={c.reconciliado}
            onReconciliar={c.handleReconciliar}
            isReconciling={c.isReconciling}
            tieneDescuadre={c.tieneDescuadre}
            totalDiferencia={c.totalDiferencia}
            obsCierre={c.obsCierre}
            isPending={c.isPending}
            onObsChange={c.setObsCierre}
            onFinalize={c.handleShowConfirmClose}
            supervisorAprobado={c.supervisorAprobado}
            onSolicitarAprobacion={c.handleSolicitarAprobacion}
            onHabilitarReconteo={c.handleHabilitarReconteo}
          />

          <TurnoResumenCard resumen={resumen} shouldReveal={shouldRevealSupervisorAudit} />

          <PagosRecientesList pagos={pagosRecientes} shouldReveal={shouldRevealSupervisorAudit} />
        </div>
      </div>

      {/* Overlay Bloqueante de Procesamiento de Cierre Z */}
      {c.isPending && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none">
          <div className="bg-card border border-border rounded-2xl p-7 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="size-14 rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center mx-auto animate-pulse">
              <Lock className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">
                Sellando Turno de Caja (Corte Z)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Registrando arqueo definitivo en la base de datos y conciliando saldos contables...
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-secondary">
              <span className="size-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
              <span>Cerrando caja y redirigiendo...</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmCloseModal
        open={c.showConfirmClose}
        onOpenChange={c.setShowConfirmClose}
        onConfirm={c.handleConfirmClose}
        systemStats={c.systemStats}
        totalEfectivoContado={c.totalEfectivoContado}
        actualCount={c.actualCount}
        totalDiferencia={c.totalDiferencia}
        tieneDescuadre={c.tieneDescuadre}
        isPending={c.isPending}
      />

      <SupervisorAuthModal
        open={c.showSupervisorModal}
        onOpenChange={c.setShowSupervisorModal}
        supEmail={c.supEmail}
        supPassword={c.supPassword}
        verifyingSup={c.verifyingSup}
        onEmailChange={c.setSupEmail}
        onPasswordChange={c.setSupPassword}
        onSubmit={c.handleVerifySupervisor}
        onCancel={() => {
          c.setShowSupervisorModal(false);
          c.setSupEmail("");
          c.setSupPassword("");
        }}
      />
    </div>
  );
}
