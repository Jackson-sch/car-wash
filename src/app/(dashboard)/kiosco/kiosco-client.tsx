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

  // Actualizar el reloj cada 10 segundos para actualizar los tiempos transcurridos en vivo
  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString("es-PE"));
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      setTimeStr(new Date(current).toLocaleTimeString("es-PE"));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sincronización en tiempo real (Auto-polling cada 3 segundos para Smart TVs)
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

  // Escuchar cambios de fullscreen del navegador (ESC key o botón exit)
  useEffect(() => {
    const handleFullscreenChange = () => {
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
    const doc = document as any;

    const isFullNow = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFullNow) {
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
          ? "fixed inset-0 z-[999999] bg-[#070b14] p-6 md:p-8 overflow-y-auto w-screen h-screen min-h-screen space-y-6 isolate animate-in fade-in duration-300"
          : "space-y-6 text-foreground animate-in fade-in duration-300"
      }
    >
      {/* Header Kiosco TV (Estilo V2 Premium Cyber-Taller) */}
      <Card suppressHydrationWarning className="bg-zinc-900/90 backdrop-blur-xl border-zinc-800 p-5 md:p-6 shadow-2xl rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Tv className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-mono">
                  Kiosco Live — Bahías de Lavado
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  EN VIVO 3S
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-bold mt-1 flex items-center gap-2">
                <span>Monitor Taller & Smart TV</span>
                <span>•</span>
                <span className="font-mono text-cyan-400 font-black">{timeStr || "--:--:--"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Stats Pills */}
            <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-1.5 shadow-inner">
              <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 block">EN BAHÍA</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{enProcesoList.length} Autos</span>
              </div>
              <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <span className="text-[9px] uppercase font-black tracking-wider text-amber-400 block">EN COLA</span>
                <span className="text-sm font-black text-amber-400 font-mono">{pendientesList.length} Autos</span>
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              type="button"
              onClick={toggleFullscreen}
              className="h-11 px-4 font-extrabold text-xs gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Salir Pantalla Completa
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Modo TV Pantalla Completa
                </>
              )}
            </Button>
          </div>
        </div>
        {/* Subtle background ambient glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </Card>

      {/* Grid Principal de Bahías */}
      <div className="space-y-8">
        {/* 1. SECCIÓN: EN PROCESO (LAVANDO AHORA) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2 font-mono">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Vehículos en Bahía de Lavado ({enProcesoList.length})
            </h2>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Temporizadores en tiempo real
            </span>
          </div>

          {enProcesoList.length === 0 ? (
            <Card className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl p-10 text-center text-zinc-500 text-xs font-semibold space-y-2">
              <Car className="h-10 w-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-300 font-bold">No hay vehículos lavándose en este momento.</p>
              <p className="text-zinc-500">Selecciona un auto de la cola de espera para iniciar su lavado.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className={`bg-zinc-900/95 border-2 rounded-3xl p-6 shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between ${
                      isOverdue
                        ? "border-rose-500 bg-rose-950/20 shadow-rose-950/50"
                        : isNearEnd
                        ? "border-amber-500 bg-amber-950/20 shadow-amber-950/50"
                        : "border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Badge Placa Top (Estilo Metálico Plateado) */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="inline-block font-black text-2xl tracking-widest bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-300 text-zinc-950 px-4 py-1.5 rounded-xl shadow-lg border border-zinc-400 uppercase font-mono">
                            {ord.placa}
                          </span>
                          <p className="text-xs font-extrabold text-white mt-2 flex items-center gap-1.5">
                            <Car className="h-4 w-4 text-cyan-400" />
                            {ord.vehiculoMarca} {ord.vehiculoModelo}
                            {ord.vehiculoTipo && (
                              <span className="text-[10px] text-zinc-400 uppercase font-bold">({ord.vehiculoTipo})</span>
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-black text-zinc-400 block tracking-wider font-mono">TICKET</span>
                          <span className="text-sm font-black text-cyan-400 font-mono">#{ord.nroTicket || "S/N"}</span>
                        </div>
                      </div>

                      {/* Cliente info */}
                      <div className="py-2.5 px-3 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block">Cliente</span>
                          <p className="font-extrabold text-white truncate">
                            {ord.clienteNombre} {ord.clienteApellido || ""}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block">Lavador Asignado</span>
                          <p className="font-extrabold text-cyan-400 flex items-center justify-end gap-1">
                            <User className="h-3.5 w-3.5" />
                            {ord.lavadorNombre ? `${ord.lavadorNombre}` : "Sin Asignar"}
                          </p>
                        </div>
                      </div>

                      {/* Timer Display */}
                      <div className="flex justify-between items-center py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                          TIEMPO EN BAHÍA
                        </span>

                        <div className={`flex items-center gap-1.5 font-black text-sm font-mono ${
                          isOverdue
                            ? "text-rose-400 animate-pulse"
                            : isNearEnd
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span>{elapsedMins} min</span>
                          {isOverdue && <span className="text-[10px] uppercase text-rose-500 font-extrabold">(EXCEDIDO)</span>}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Finalización */}
                    <div className="pt-4">
                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCambiarEstado(ord.id, "completado")}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm h-12 rounded-2xl gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        FINALIZAR LAVADO
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. SECCIÓN: COLA DE ESPERA (PENDIENTES - EXACT STITCH V2 STYLING) */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2 font-mono">
            <Clock className="h-4 w-4 text-amber-400" />
            Vehículos en Cola de Espera ({pendientesList.length})
          </h2>

          {pendientesList.length === 0 ? (
            <Card className="bg-[#0b0f17] border border-[#1e293b] rounded-3xl p-6 text-center text-xs text-zinc-400 font-semibold">
              No hay vehículos esperando en la cola de recepción.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {pendientesList.map((ord, idx) => {
                const isFirstTurn = idx === 0;

                return (
                  <Card
                    key={ord.id}
                    className="bg-[#0b0f17] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-2xl relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Plate + Turn Badge */}
                      <div className="flex justify-between items-center gap-2">
                        {/* Metal License Plate */}
                        <div
                          className={`font-mono font-black text-base md:text-lg tracking-widest px-4 py-1.5 rounded-xl shadow-md border-2 uppercase flex items-center justify-center ${
                            isFirstTurn
                              ? "bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 text-slate-950 border-slate-400 shadow-slate-900/50"
                              : "bg-gradient-to-b from-amber-400 via-amber-300 to-amber-500 text-amber-950 border-amber-300 shadow-amber-950/50"
                          }`}
                        >
                          {ord.placa}
                        </div>

                        {/* Turn Badge */}
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-black uppercase tracking-wider rounded-xl shadow-sm">
                          TURNO #{idx + 1}
                        </span>
                      </div>

                      {/* Vehicle & Client Info */}
                      <div className="space-y-1 pt-1">
                        <h3 className="text-sm md:text-base font-extrabold text-white">
                          {ord.vehiculoMarca} {ord.vehiculoModelo}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">
                          Cliente: <span className="text-zinc-200 font-semibold">{ord.clienteNombre} {ord.clienteApellido || ""}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Button: Glowing Solid Orange */}
                    <div className="pt-5">
                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCambiarEstado(ord.id, "en_proceso")}
                        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#0f172a] font-black text-xs md:text-sm h-11 rounded-xl gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.45)] border border-amber-300 uppercase tracking-wider transition-all"
                      >
                        <Play className="h-4 w-4 fill-[#0f172a] text-[#0f172a]" />
                        INICIAR LAVADO
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. SECCIÓN: RECIÉMENTE COMPLETADOS (AVISO WHATSAPP) */}
        {completadosRecientes.length > 0 && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              Listos para Retiro — Avisar al Cliente ({completadosRecientes.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {completadosRecientes.map((ord) => {
                const totalNum = parseFloat(ord.total || "0") || 0;
                const clienteTel = (ord as any).clienteTelefono || null;
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
                  <Card key={ord.id} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 text-xs flex flex-col justify-between shadow-md">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-white">
                        <span className="font-mono font-black text-sm">{ord.placa}</span>
                        <span className="text-emerald-400 font-extrabold text-xs">S/ {totalNum.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-medium">{ord.clienteNombre}</p>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] h-8 rounded-xl transition-all shadow-sm"
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
    </div>
  );
}
