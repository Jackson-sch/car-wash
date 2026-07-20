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

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      <CierreHeader
        turno={turno}
        systemStats={c.systemStats}
        onPrint={c.handlePrint}
      />

      <CierreGuideBox />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        <div className="lg:col-span-8 space-y-6 print:!w-full print:!max-w-full">
          <TurnoInfoCard turno={turno} systemStats={c.systemStats} />

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
          />

          <ArqueoEfectivo
            cantidades={c.cantidades}
            onCantidadesChange={c.handleCantidadesChange}
            totalEfectivoContado={c.totalEfectivoContado}
          />
        </div>

        <div className="lg:col-span-4 space-y-6 print:!w-full print:!max-w-full">
          <TurnoResumenCard resumen={resumen} />
          <PagosRecientesList pagos={pagosRecientes} />

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
          />
        </div>
      </div>

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
