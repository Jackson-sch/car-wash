"use client";

import { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cerrarTurnoCaja,
  verificarAutorizacionSupervisor,
  registrarIntentoArqueoCaja,
} from "@/lib/actions/caja";
import { notifyCajaStatusChanged } from "@/lib/events/caja-events";
import type { TurnoActivo } from "../types";
import { DENOMINACIONES } from "../types";

const STORAGE_KEY_PREFIX = "washmaster_arqueo_audit_";

export function useCierreCaja(turno: TurnoActivo) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isClosing, setIsClosing] = useState(false);

  // Estado de conciliación (inicia en false para consistencia estricta SSR)
  const [reconciliado, setReconciliado] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Bloqueo persistente por discrepancia antifraude
  const [bloqueadoPorDiscrepancia, setBloqueadoPorDiscrepancia] = useState(false);

  // Confirmación final antes del cierre
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Aprobación de supervisor
  const [supervisorAprobado, setSupervisorAprobado] = useState<{
    id: string;
    nombre: string;
    email: string;
    rol: string;
  } | null>(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Credenciales de supervisor para el modal
  const [supEmail, setSupEmail] = useState("");
  const [supPassword, setSupPassword] = useState("");
  const [verifyingSup, setVerifyingSup] = useState(false);

  // Estado del arqueo de denominaciones
  const [cantidades, setCantidades] = useState<Record<string, string>>({});

  // Contadores reales ingresados por el cajero
  const [actualCount, setActualCount] = useState<Record<string, string>>({
    tarjeta: "",
    yapePlin: "",
    transferencia: "",
  });

  // Estado para observaciones / justificación
  const [obsCierre, setObsCierre] = useState("");

  // Sincronizar intento de auditoría previo en cliente de forma diferida (evita mismatch en SSR)
  useEffect(() => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${turno.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.hasDiscrepancy) {
          startTransition(() => {
            setCantidades(parsed.cantidades || {});
            setActualCount(parsed.actualCount || { tarjeta: "", yapePlin: "", transferencia: "" });
            setReconciliado(true);
            setBloqueadoPorDiscrepancia(true);
          });
        }
      }
    } catch (e) {
      console.error("Error restaurando auditoría:", e);
    }
  }, [turno.id]);

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

  // Si está bloqueado por discrepancia, no se permite editar campos sin supervisor
  const handleActualCountChange = useCallback(
    (id: string, value: string) => {
      if (bloqueadoPorDiscrepancia && !supervisorAprobado) {
        toast.error("El arqueo está bloqueado por discrepancia. Solicite autorización a un supervisor.");
        return;
      }
      if (reconciliado && !bloqueadoPorDiscrepancia) {
        setReconciliado(false);
        setSupervisorAprobado(null);
      }
      setActualCount((prev) => ({ ...prev, [id]: value }));
    },
    [bloqueadoPorDiscrepancia, supervisorAprobado, reconciliado]
  );

  const handleCantidadesChange = useCallback(
    (id: string, value: string) => {
      if (bloqueadoPorDiscrepancia && !supervisorAprobado) {
        toast.error("El arqueo está bloqueado por discrepancia. Solicite autorización a un supervisor.");
        return;
      }
      if (reconciliado && !bloqueadoPorDiscrepancia) {
        setReconciliado(false);
        setSupervisorAprobado(null);
      }
      setCantidades((prev) => ({ ...prev, [id]: value }));
    },
    [bloqueadoPorDiscrepancia, supervisorAprobado, reconciliado]
  );

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

  // Acción principal: Verificar conteo
  const handleReconciliar = async () => {
    if (
      !actualCount.tarjeta.trim() ||
      !actualCount.yapePlin.trim() ||
      !actualCount.transferencia.trim()
    ) {
      toast.error(
        "Por favor complete los montos contados de Tarjeta, Yape/Plin y Transferencia (coloque 0 si no hubo movimientos)."
      );
      return;
    }

    setIsReconciling(true);

    // Si hay descuadre: ANTIFRAUDE ACTIVO
    if (tieneDescuadre) {
      // 1. Guardar en Base de Datos de manera inmutable
      const detallesAudit = `Gaveta: S/ ${totalEfectivoContado.toFixed(2)} | POS: S/ ${parseFloat(actualCount.tarjeta || "0").toFixed(2)} | Yape/Plin: S/ ${parseFloat(actualCount.yapePlin || "0").toFixed(2)} | Transf: S/ ${parseFloat(actualCount.transferencia || "0").toFixed(2)}`;

      await registrarIntentoArqueoCaja({
        turnoId: turno.id,
        totalDeclarado: actualTotals,
        diferencia: totalDiferencia,
        detalles: detallesAudit,
      });

      // 2. Guardar en storage local para que una recarga de página no borre el intento
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${turno.id}`,
          JSON.stringify({
            cantidades,
            actualCount,
            totalEfectivoContado,
            actualTotals,
            hasDiscrepancy: true,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.error("Error guardando snapshot local:", e);
      }

      setReconciliado(true);
      setBloqueadoPorDiscrepancia(true);
      setIsReconciling(false);

      // Aviso sin revelar montos exactos ni si es sobrante o faltante al cajero
      toast.error(
        "Discrepancia detectada en el arqueo. Por seguridad, el cierre requiere validación de un Supervisor.",
        { duration: 5000 }
      );
      setShowSupervisorModal(true);
    } else {
      // Caja Cuadrada
      // Limpiar cualquier flag anterior
      try {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${turno.id}`);
      } catch {}
      setReconciliado(true);
      setBloqueadoPorDiscrepancia(false);
      setIsReconciling(false);
      toast.success("Caja Cuadrada al 100%. Los montos físicos coinciden exactamente con el sistema.");
    }
  };

  const handleSolicitarAprobacion = useCallback(() => {
    setShowSupervisorModal(true);
  }, []);

  // Validación de credenciales de supervisor
  const handleVerifySupervisor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("email") as string) || supEmail).trim();
    const password = ((formData.get("password") as string) || supPassword).trim();

    if (!email || !password) {
      toast.error("Por favor complete los campos de email y contraseña.");
      return;
    }

    setVerifyingSup(true);
    try {
      const res = await verificarAutorizacionSupervisor(email, password);
      if (res.success && res.supervisor) {
        setSupervisorAprobado(res.supervisor);
        setShowSupervisorModal(false);
        toast.success(`Auditoría desbloqueada por supervisor: ${res.supervisor.nombre}`);
        setSupEmail("");
        setSupPassword("");
      } else {
        toast.error(res.error || "No se pudo verificar la autorización del supervisor.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al validar autorización del supervisor.");
    } finally {
      setVerifyingSup(false);
    }
  };

  // Reconteo presencial autorizado por supervisor
  const handleHabilitarReconteo = useCallback(() => {
    if (!supervisorAprobado) {
      toast.error("Se requiere la autorización de un supervisor para reiniciar el conteo.");
      return;
    }

    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${turno.id}`);
    } catch {}

    setBloqueadoPorDiscrepancia(false);
    setReconciliado(false);
    setSupervisorAprobado(null);
    toast.info("Reconteo presencial habilitado. Realice el recuento junto al supervisor.");
  }, [supervisorAprobado, turno.id]);

  const handleShowConfirmClose = () => {
    if (!reconciliado) {
      toast.error("Por favor verifique los saldos primero.");
      return;
    }

    if (tieneDescuadre && !supervisorAprobado) {
      toast.error("Cierre bloqueado por discrepancia. Requiere autorización de un Supervisor.");
      setShowSupervisorModal(true);
      return;
    }

    if (tieneDescuadre && !obsCierre.trim()) {
      toast.error("Por favor ingresa una observación justificando el descuadre de caja.");
      return;
    }

    setShowConfirmClose(true);
  };

  const handleConfirmClose = async () => {
    setShowConfirmClose(false);
    setIsClosing(true);

    try {
      const supervisorInfoStr = supervisorAprobado
        ? `\n\n[AUTORIZADO POR SUPERVISOR: ${supervisorAprobado.nombre} (${supervisorAprobado.email}) - ROL: ${supervisorAprobado.rol}]`
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
[CORTE DE CAJA DETALLADO - ARQUEO A CIEGAS AUDITADO]
- Fondo Inicial: S/ ${systemStats.openingCash.toFixed(2)}
- Efectivo Esperado: S/ ${systemStats.expectedEfectivo.toFixed(2)} | Contado: S/ ${totalEfectivoContado.toFixed(2)} (Dif: S/ ${cashDiferencia.toFixed(2)})
- Tarjeta Esperado: S/ ${systemStats.tarjetaVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.tarjeta) || 0).toFixed(2)} (Dif: S/ ${tarjetaDiferencia.toFixed(2)})
- Yape/Plin Esperado: S/ ${systemStats.yapePlinVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.yapePlin) || 0).toFixed(2)} (Dif: S/ ${yapePlinDiferencia.toFixed(2)})
- Transferencias Esperado: S/ ${systemStats.transferenciasVentas.toFixed(2)} | Contado: S/ ${(parseFloat(actualCount.transferencia) || 0).toFixed(2)} (Dif: S/ ${transferDiferencia.toFixed(2)})

[DESGLOSE DE EFECTIVO GAVETA]
${efectivoDetalle || "  (Sin desglose especificado)"}

[OBSERVACIONES GENERALES]
${obsCierre.trim() || "Sin observaciones adicionales."}${supervisorInfoStr}
`.trim();

      const res = await cerrarTurnoCaja({
        montoFinal: totalEfectivoContado.toString(),
        observaciones: finalObservaciones,
      });

      if (res.success) {
        try {
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${turno.id}`);
        } catch {}
        toast.success("Turno de caja cerrado correctamente. Redirigiendo...");
        notifyCajaStatusChanged();
        router.replace("/caja");
        router.refresh();
        setTimeout(() => {
          window.location.href = "/caja";
        }, 1500);
      } else {
        setIsClosing(false);
        toast.error(res.error || "Ocurrió un error al cerrar la caja");
      }
    } catch (err) {
      console.error("Error al procesar el cierre de caja:", err);
      setIsClosing(false);
      toast.error("Ocurrió un error inesperado al procesar el cierre");
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return {
    isPending: isClosing,
    reconciliado,
    isReconciling,
    bloqueadoPorDiscrepancia,
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
    handleHabilitarReconteo,
    handleShowConfirmClose,
    handleConfirmClose,
    handlePrint,
  };
}
