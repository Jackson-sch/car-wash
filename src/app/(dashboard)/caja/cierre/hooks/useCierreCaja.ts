"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cerrarTurnoCaja, verificarAutorizacionSupervisor } from "@/lib/actions/caja";
import type { TurnoActivo } from "../types";
import { DENOMINACIONES } from "../types";

export function useCierreCaja(turno: TurnoActivo) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado de conciliación ciega
  const [reconciliado, setReconciliado] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Confirmación final antes del cierre
  const [showConfirmClose, setShowConfirmClose] = useState(false);

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

    const totalEgresos = turno.totalEgresos || 0;
    const expectedEfectivo = Math.max(0, openingCash + efectivoVentas - totalEgresos);

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas,
      transferenciasVentas,
      totalEgresos,
      expectedEfectivo,
    };
  }, [turno]);

  // Contadores reales ingresados por el cajero (inicializados en vacío para el arqueo a ciegas)
  const [actualCount, setActualCount] = useState<Record<string, string>>({
    tarjeta: "",
    yapePlin: "",
    transferencia: "",
  });

  const handleActualCountChange = useCallback((id: string, value: string) => {
    if (reconciliado) {
      setReconciliado(false);
      setSupervisorAprobado(null);
    }
    setActualCount((prev) => ({ ...prev, [id]: value }));
  }, [reconciliado]);

  const handleCantidadesChange = useCallback((id: string, value: string) => {
    if (reconciliado) {
      setReconciliado(false);
      setSupervisorAprobado(null);
    }
    setCantidades((prev) => ({ ...prev, [id]: value }));
  }, [reconciliado]);

  // Calcular el total de efectivo contado físicamente
  const totalEfectivoContado = useMemo(() => {
    let sum = 0;
    DENOMINACIONES.forEach((d) => {
      const cant = parseInt(cantidades[d.id] || "0") || 0;
      sum += cant * d.val;
    });
    return sum;
  }, [cantidades]);

  const expectedTotals =
    systemStats.expectedEfectivo +
    systemStats.tarjetaVentas +
    systemStats.yapePlinVentas +
    systemStats.transferenciasVentas;

  const actualTotals =
    totalEfectivoContado +
    (parseFloat(actualCount.tarjeta) || 0) +
    (parseFloat(actualCount.yapePlin) || 0) +
    (parseFloat(actualCount.transferencia) || 0);

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

  const handleReconciliar = () => {
    if (!actualCount.tarjeta.trim() || !actualCount.yapePlin.trim() || !actualCount.transferencia.trim()) {
      toast.error("Por favor complete los montos contados de Tarjeta, Yape/Plin y Transferencia (coloque 0 si no hubo movimientos).");
      return;
    }
    setIsReconciling(true);
    setTimeout(() => {
      setReconciliado(true);
      setIsReconciling(false);
      toast.success("Saldos calculados y conciliados contra el sistema.");
    }, 400);
  };

  const handleSolicitarAprobacion = useCallback(() => {
    setShowSupervisorModal(true);
  }, []);

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

  const handleShowConfirmClose = () => {
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

    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);

    startTransition(async () => {
      const supervisorInfoStr = supervisorAprobado
        ? `\n\n[AUTORIZADO POR SUPERVISOR: ${supervisorAprobado.nombre} (${supervisorAprobado.email})]`
        : "";

      const efectivoDetalle = DENOMINACIONES
        .map((d) => {
          const cant = parseInt(cantidades[d.id] || "0") || 0;
          return cant > 0
            ? "  * " + d.label + ": " + cant + " u. = S/ " + (cant * d.val).toFixed(2)
            : null;
        })
        .filter((line): line is string => line !== null)
        .join("\n");

      const finalObservaciones = `
[CORTE DE CAJA DETALLADO - ARQUEO A CIEGAS]
- Fondo Inicial: S/ ${systemStats.openingCash.toFixed(2)}
- Efectivo Esperado: S/ ${systemStats.expectedEfectivo.toFixed(2)} | Contado: S/ ${totalEfectivoContado.toFixed(2)} (Dif: S/ ${cashDiferencia.toFixed(2)})
- Tarjeta Esperado: S/ ${systemStats.tarjetaVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.tarjeta) || 0).toFixed(2)} (Dif: S/ ${tarjetaDiferencia.toFixed(2)})
- Yape/Plin Esperado: S/ ${systemStats.yapePlinVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.yapePlin) || 0).toFixed(2)} (Dif: S/ ${yapePlinDiferencia.toFixed(2)})
- Transferencias Esperado: S/ ${systemStats.transferenciasVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.transferencia) || 0).toFixed(2)} (Dif: S/ ${transferDiferencia.toFixed(2)})

[DESGLOSE DE EFECTIVO]
${efectivoDetalle}

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

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return {
    isPending,
    reconciliado,
    isReconciling,
    showConfirmClose,
    setShowConfirmClose,
    supervisorAprobado,
    showSupervisorModal,
    setShowSupervisorModal,
    supEmail,
    setSupEmail,
    supPassword,
    setSupPassword,
    verifyingSup,
    cantidades,
    obsCierre,
    setObsCierre,
    systemStats,
    actualCount,
    handleActualCountChange,
    handleCantidadesChange,
    totalEfectivoContado,
    expectedTotals,
    actualTotals,
    totalDiferencia,
    cashDiferencia,
    tarjetaDiferencia,
    yapePlinDiferencia,
    transferDiferencia,
    tieneDescuadre,
    handleReconciliar,
    handleSolicitarAprobacion,
    handleVerifySupervisor,
    handleShowConfirmClose,
    handleConfirmClose,
    handlePrint,
  };
}
