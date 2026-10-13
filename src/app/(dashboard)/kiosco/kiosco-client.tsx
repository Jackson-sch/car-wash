"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Tv,
  Clock,
  CheckCircle2,
  Play,
  Car,
  User,
  Sparkles,
  MessageCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateOrdenEstado, getOrdenes } from "@/lib/actions/ordenes";
import { toast } from "sonner";
import { formatWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp-utils";

interface Lavador {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface OrdenItem {
  id: string;
  nroTicket: string | null;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  prioridad: number | null;
  total: string | null;
  createdAt: Date | string | null;
  updatedAt?: Date | string | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: string | null;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono?: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
}

interface KioscoClientProps {
  initialOrdenes: OrdenItem[];
  lavadores: Lavador[];
}

export function KioscoClient({ initialOrdenes }: KioscoClientProps) {
  const [ordenesList, setOrdenesList] = useState<OrdenItem[]>(initialOrdenes);
  const [now, setNow] = useState<number>(Date.now());
  const [timeStr, setTimeStr] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Actualizar el reloj cada 10 segundos
  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString("es-PE"));
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      setTimeStr(new Date(current).toLocaleTimeString("es-PE"));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sincronización en tiempo real (Auto-polling cada 3 segundos)
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const latest = await getOrdenes();
        if (latest && Array.isArray(latest)) {
          setOrdenesList(latest as unknown as OrdenItem[]);
        }
      } catch {
        // Silencioso
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, []);

  // Escuchar cambios de fullscreen del navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = document as any;
      const isFull = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const container = document.getElementById("kiosco-fullscreen-container") || document.documentElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any;

    const isFullNow = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFullNow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elem = container as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleCambiarEstado = (
    id: string,
    nuevoEstado: "pendiente" | "en_proceso" | "completado"
  ) => {
    startTransition(async () => {
      const res = await updateOrdenEstado(id, nuevoEstado);
      if (res.success) {
        toast.success(
          nuevoEstado === "en_proceso"
            ? "¡Lavado iniciado en bahía!"
            : "¡Lavado completado! Listo para retiro."
        );
        setOrdenesList((prev) =>
          prev.map((o) => (o.id === id ? { ...o, estado: nuevoEstado } : o))
        );
      } else {
        toast.error("Error al actualizar la orden.");
      }
    });
  };

  // Filtrar órdenes por estado
  const enProcesoList = ordenesList.filter((o) => o.estado === "en_proceso");
  const pendientesList = ordenesList.filter((o) => o.estado === "pendiente");
  const completadosRecientes = ordenesList
    .filter((o) => o.estado === "completado")
    .slice(0, 6);

  return (
    <div
      id="kiosco-fullscreen-container"
      suppressHydrationWarning
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-background text-foreground p-6 md:p-8 overflow-y-auto w-screen h-screen min-h-screen space-y-6 transition-colors duration-200"
          : "space-y-6 md:space-y-8 text-foreground transition-colors duration-200"
      }
    >
      {/* Header Limpio y Sólido */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Tv className="size-7 text-secondary" />
              Kiosco Live — Bahías de Lavado
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              En Vivo
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 font-medium">
            <span>Monitor de taller y control de bahías en tiempo real</span>
            <span>•</span>
            <span className="font-mono font-bold text-foreground">{timeStr || "--:--:--"}</span>
          </p>
        </div>

        {/* Botón de Pantalla Completa */}
        <Button
          type="button"
          variant="outline"
          onClick={toggleFullscreen}
          className="h-10 px-4 font-bold text-xs gap-2 rounded-xl border-border bg-card hover:bg-muted text-foreground cursor-pointer shadow-xs transition-colors shrink-0"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              Salir Pantalla Completa
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 text-secondary" />
              Modo TV Pantalla Completa
            </>
          )}
        </Button>
      </div>

      {/* KPI Cards Sólidos y Compactos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card border-border px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block leading-tight">
                En Bahía (Lavándose)
              </span>
              <p className="text-[11px] text-muted-foreground/80 leading-tight mt-0.5">Vehículos en proceso activo</p>
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono pl-3 shrink-0">
            {enProcesoList.length}
          </div>
        </Card>

        <Card className="bg-card border-border px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block leading-tight">
                En Cola de Espera
              </span>
              <p className="text-[11px] text-muted-foreground/80 leading-tight mt-0.5">Pendientes de inicio</p>
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono pl-3 shrink-0">
            {pendientesList.length}
          </div>
        </Card>

        <Card className="bg-card border-border px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block leading-tight">
                Listos para Retiro
              </span>
              <p className="text-[11px] text-muted-foreground/80 leading-tight mt-0.5">Lavado finalizado</p>
            </div>
          </div>
          <div className="text-2xl font-black text-foreground font-mono pl-3 shrink-0">
            {completadosRecientes.length}
          </div>
        </Card>
      </div>

      {/* 1. SECCIÓN: VEHÍCULOS EN BAHÍA DE LAVADO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Car className="h-4.5 w-4.5 text-secondary" />
            <span>Vehículos en Bahía de Lavado</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              {enProcesoList.length}
            </span>
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            Temporizadores en tiempo real
          </span>
        </div>

        {enProcesoList.length === 0 ? (
          <Card className="bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground text-xs font-medium space-y-2">
            <Car className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-foreground font-bold text-sm">No hay vehículos lavándose en este momento.</p>
            <p className="text-muted-foreground">Selecciona un vehículo de la cola de espera para iniciar su lavado.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enProcesoList.map((ord) => {
              const startTimeMs = ord.updatedAt
                ? new Date(ord.updatedAt).getTime()
                : ord.createdAt
                ? new Date(ord.createdAt).getTime()
                : now;
              const elapsedMins = Math.max(1, Math.floor((now - startTimeMs) / 60000));
              const duracionEstimada = 30; // 30 min estándar
              const isOverdue = elapsedMins > duracionEstimada;
              const isNearEnd = elapsedMins >= duracionEstimada - 5 && !isOverdue;

              return (
                <Card
                  key={ord.id}
                  className={`bg-card border rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between ${
                    isOverdue
                      ? "border-rose-500/50 bg-rose-500/5"
                      : isNearEnd
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Fila Placa + Ticket */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {/* Placa Estilo Perú Sólida */}
                        <div className="inline-flex flex-col items-center justify-center bg-card border-2 border-foreground/80 rounded-xl px-4 py-1 font-mono shadow-xs select-all">
                          <span className="text-[7.5px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
                            PERÚ
                          </span>
                          <span className="text-xl md:text-2xl font-black text-foreground tracking-wider leading-none mt-1 uppercase">
                            {ord.placa}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground mt-2 flex items-center gap-1.5">
                          <Car className="h-3.5 w-3.5 text-secondary" />
                          <span>{ord.vehiculoMarca} {ord.vehiculoModelo}</span>
                          {ord.vehiculoTipo && (
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                              ({ord.vehiculoTipo})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block font-mono">
                          TICKET
                        </span>
                        <span className="text-xs font-bold text-secondary font-mono bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-md inline-block">
                          #{ord.nroTicket || "S/N"}
                        </span>
                      </div>
                    </div>

                    {/* Cliente y Lavador Asignado */}
                    <div className="p-3 bg-muted/40 border border-border rounded-xl grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                          Cliente
                        </span>
                        <p className="font-bold text-foreground truncate">
                          {ord.clienteNombre} {ord.clienteApellido || ""}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right min-w-0">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                          Lavador
                        </span>
                        <p className="font-bold text-foreground flex items-center justify-end gap-1 truncate">
                          <User className="h-3 w-3 text-secondary shrink-0" />
                          <span className="truncate">{ord.lavadorNombre ? ord.lavadorNombre : "Sin Asignar"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Temporizador */}
                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-muted/30 border border-border text-xs">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                        Tiempo en Bahía
                      </span>
                      <div
                        className={`flex items-center gap-1.5 font-mono font-bold text-xs ${
                          isOverdue
                            ? "text-rose-600 dark:text-rose-400 font-extrabold"
                            : isNearEnd
                            ? "text-amber-600 dark:text-amber-400 font-extrabold"
                            : "text-foreground"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>{elapsedMins} min</span>
                        {isOverdue && (
                          <span className="text-[9px] uppercase text-rose-600 dark:text-rose-400 font-black">
                            (EXCEDIDO)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Finalización */}
                  <div className="pt-4">
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCambiarEstado(ord.id, "completado")}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Finalizar Lavado
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. SECCIÓN: COLA DE ESPERA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-amber-500" />
            <span>Vehículos en Cola de Espera</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {pendientesList.length}
            </span>
          </h2>
        </div>

        {pendientesList.length === 0 ? (
          <Card className="bg-card border border-border rounded-2xl p-6 text-center text-xs text-muted-foreground font-medium">
            No hay vehículos esperando en la cola de recepción.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendientesList.map((ord, idx) => (
              <Card
                key={ord.id}
                className="bg-card border border-border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs hover:border-border transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <div className="inline-flex flex-col items-center justify-center bg-card border-2 border-foreground/80 rounded-xl px-3 py-1 font-mono shadow-xs select-all">
                      <span className="text-[7px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
                        PERÚ
                      </span>
                      <span className="text-base font-black text-foreground tracking-wider leading-none mt-0.5 uppercase">
                        {ord.placa}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold uppercase rounded-lg">
                      Turno #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {ord.vehiculoMarca} {ord.vehiculoModelo}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Cliente: <span className="text-foreground font-medium">{ord.clienteNombre} {ord.clienteApellido || ""}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleCambiarEstado(ord.id, "en_proceso")}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-10 rounded-xl gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                    Iniciar Lavado
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN: LISTOS PARA RETIRO (AVISO WHATSAPP) */}
      {completadosRecientes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              <span>Listos para Retiro</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {completadosRecientes.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {completadosRecientes.map((ord) => {
              const totalNum = parseFloat(ord.total || "0") || 0;
              const clienteTel = ord.clienteTelefono || null;
              const msg = formatWhatsAppMessage({
                clienteNombre: ord.clienteNombre,
                clienteTelefono: clienteTel,
                placa: ord.placa,
                vehiculoInfo: `${ord.vehiculoMarca || ""} ${ord.vehiculoModelo || ""}`.trim(),
                servicioNombre: "Servicio de Lavado",
                total: totalNum,
                sucursalNombre: "WashMaster Pro",
                nroTicket: ord.nroTicket,
              });
              const waUrl = buildWhatsAppUrl(clienteTel, msg);

              return (
                <Card
                  key={ord.id}
                  className="bg-card border border-border rounded-xl p-3 text-xs flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center font-bold text-foreground">
                      <span className="font-mono font-black text-sm">{ord.placa}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        S/ {totalNum.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {ord.clienteNombre}
                    </p>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] h-8 rounded-lg transition-colors shadow-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
