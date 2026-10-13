"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Maximize,
  Minimize,
  Clock,
  Car,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  User,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrdenes } from "@/lib/actions/ordenes";
import type { Orden } from "@/app/(dashboard)/ordenes/components/OrdenesTable";
import { useOrdenesRealtime } from "@/app/(dashboard)/ordenes/hooks/useOrdenesRealtime";

interface PatioClientProps {
  initialOrdenes: Orden[];
  sucursal?: {
    id?: string;
    nombre?: string;
    telefono?: string | null;
  } | null;
}

export function PatioClient({ initialOrdenes, sucursal }: PatioClientProps) {
  const [ordenes, setOrdenes] = useState<Orden[]>(initialOrdenes);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "en_proceso" | "pendiente" | "completado">("todos");

  // ── Suscripción en Tiempo Real (Supabase Realtime WebSockets + BroadcastChannel) ──
  useOrdenesRealtime(setOrdenes, () => {
    setLastUpdated(new Date());
  });

  // Reloj digital en vivo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("es-PE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Polling de respaldo secundario (cada 10s) para navegadores Smart TV
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const fresh = await getOrdenes();
        if (fresh && fresh.length > 0) {
          setOrdenes(fresh);
          setLastUpdated(new Date());
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Control de pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Filtrar solo las órdenes activas en el patio
  const ordenesActivas = useMemo(() => {
    return ordenes.filter(
      (o) => o.estado === "pendiente" || o.estado === "en_proceso" || o.estado === "completado"
    );
  }, [ordenes]);

  const ordenesFiltradas = useMemo(() => {
    if (filtroEstado === "todos") return ordenesActivas;
    return ordenesActivas.filter((o) => o.estado === filtroEstado);
  }, [ordenesActivas, filtroEstado]);

  const stats = useMemo(() => {
    const enEspera = ordenesActivas.filter((o) => o.estado === "pendiente").length;
    const enLavado = ordenesActivas.filter((o) => o.estado === "en_proceso").length;
    const listos = ordenesActivas.filter((o) => o.estado === "completado").length;
    return { enEspera, enLavado, listos, total: ordenesActivas.length };
  }, [ordenesActivas]);

  // Cálculo de tiempo transcurrido y semáforo
  const getTimeInfo = (createdAt: Date | null) => {
    if (!createdAt) return { text: "—", mins: 0, status: "normal" as const };
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    let status: "normal" | "warning" | "danger" = "normal";
    if (diffMins > 45) {
      status = "danger";
    } else if (diffMins > 25) {
      status = "warning";
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const text = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    return { text, mins: diffMins, status };
  };

  return (
    <div
      className={`min-h-screen bg-[#090a0f] text-white flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 select-none font-sans ${
        isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : "rounded-3xl border border-zinc-800/80 shadow-2xl"
      }`}
    >
      {/* ── Top Bar para Smart TV de Taller ────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          <Link href="/ordenes" passHref>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-[#12141c] hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl h-11 px-3.5 cursor-pointer shadow-sm transition-colors"
              title="Volver a la bandeja de órdenes"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
                {sucursal?.nombre || "WashMaster Pro"} • Monitor de Patio
              </h1>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-sans font-bold">
                EN VIVO
              </span>
              <span>Sincronizado: {lastUpdated.toLocaleTimeString("es-PE")}</span>
              {isPending && <span className="text-sky-400 animate-pulse font-bold">(Actualizando...)</span>}
            </p>
          </div>
        </div>

        {/* Reloj Digital Gigante & Botón Fullscreen */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-sm">
              {currentTime || "--:--:--"}
            </div>
            <div className="text-xs text-zinc-400 capitalize font-bold tracking-wide mt-0.5">
              {currentDate || "Cargando fecha..."}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={toggleFullscreen}
            className="border-zinc-700 bg-[#12141c] hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl h-12 px-4 cursor-pointer shrink-0 shadow-md transition-all active:scale-95"
            title={isFullscreen ? "Salir de pantalla completa" : "Modo Pantalla Completa para Smart TV"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* ── KPI Widgets Rápidos con Alto Contraste ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {/* Total en Patio */}
        <button
          type="button"
          onClick={() => setFiltroEstado("todos")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg ${
            filtroEstado === "todos"
              ? "bg-[#161822] border-zinc-500 ring-2 ring-zinc-400/50 scale-[1.01]"
              : "bg-[#11131a] border-zinc-800/90 hover:bg-[#161822] hover:border-zinc-700"
          }`}
        >
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Total en Patio
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-white mt-1.5 drop-shadow-md">
            {stats.total}
          </div>
        </button>

        {/* En Espera */}
        <button
          type="button"
          onClick={() => setFiltroEstado("pendiente")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg ${
            filtroEstado === "pendiente"
              ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 scale-[1.01]"
              : "bg-[#15120a] border-amber-900/40 hover:bg-amber-950/30 hover:border-amber-700/60"
          }`}
        >
          <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> En Espera
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 mt-1.5 drop-shadow-md">
            {stats.enEspera}
          </div>
        </button>

        {/* En Lavado */}
        <button
          type="button"
          onClick={() => setFiltroEstado("en_proceso")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg ${
            filtroEstado === "en_proceso"
              ? "bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/50 scale-[1.01]"
              : "bg-[#0a1218] border-sky-900/40 hover:bg-sky-950/30 hover:border-sky-700/60"
          }`}
        >
          <div className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5" /> En Lavado
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-sky-400 mt-1.5 drop-shadow-md">
            {stats.enLavado}
          </div>
        </button>

        {/* Listos para Entrega */}
        <button
          type="button"
          onClick={() => setFiltroEstado("completado")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg ${
            filtroEstado === "completado"
              ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.01]"
              : "bg-[#091510] border-emerald-900/40 hover:bg-emerald-950/30 hover:border-emerald-700/60"
          }`}
        >
          <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Listos para Retiro
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-1.5 drop-shadow-md">
            {stats.listos}
          </div>
        </button>
      </div>

      {/* ── Grid Principal de Tarjetas / Bahías ─────────────────────────────────── */}
      {ordenesFiltradas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <div className="size-20 rounded-3xl bg-[#12141c] border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
            <Sparkles className="size-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            No hay vehículos activos en patio
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">
            Los nuevos vehículos registrados en caja o recepción aparecerán automáticamente en esta pantalla.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 flex-1">
          {ordenesFiltradas.map((orden) => {
            const time = getTimeInfo(orden.createdAt);

            return (
              <div
                key={orden.id}
                className={`p-5 sm:p-6 rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 shadow-2xl bg-[#12141d] ${
                  orden.estado === "completado"
                    ? "border-emerald-500/70 shadow-emerald-950/20"
                    : orden.estado === "en_proceso"
                      ? "border-sky-500/70 shadow-sky-950/20"
                      : "border-amber-500/70 shadow-amber-950/20"
                }`}
              >
                <div>
                  {/* Badge de Estado y Semáforo de Tiempo */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        orden.estado === "completado"
                          ? "bg-emerald-500 text-zinc-950"
                          : orden.estado === "en_proceso"
                            ? "bg-sky-500 text-zinc-950"
                            : "bg-amber-500 text-zinc-950"
                      }`}
                    >
                      {orden.estado === "completado"
                        ? "LISTO"
                        : orden.estado === "en_proceso"
                          ? "EN LAVADO"
                          : "EN ESPERA"}
                    </Badge>

                    {/* Semáforo de Tiempo en Patio */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                        time.status === "danger"
                          ? "bg-rose-500/25 text-rose-300 border-rose-500/60 animate-pulse"
                          : time.status === "warning"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      }`}
                    >
                      {time.status === "danger" && <Flame className="size-3.5 text-rose-400" />}
                      <Clock className="size-3.5" />
                      <span>{time.text}</span>
                    </div>
                  </div>

                  {/* Placa Gigante en Geist Mono (Alto Contraste Smart TV) */}
                  <div className="relative py-4 px-3 rounded-2xl bg-[#0b0c10] border-2 border-zinc-700/80 text-center my-3 shadow-inner select-all">
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase block mb-0.5">
                      PERÚ
                    </span>
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-widest text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
                      {orden.placa}
                    </span>
                  </div>

                  {/* Marca y Modelo del Vehículo */}
                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate">
                      {[orden.vehiculoMarca, orden.vehiculoModelo].filter(Boolean).join(" ") || "Vehículo sin modelo"}
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-0.5 capitalize">
                      {orden.vehiculoTipo || "Auto"} • Ticket #{orden.nroTicket || orden.id.substring(0, 6).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Footer de Tarjeta: Lavador Asignado */}
                <div className="mt-6 pt-3.5 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-zinc-300">
                      <User className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9.5px] text-zinc-400 uppercase font-black tracking-wider">
                        Lavador Asignado
                      </div>
                      <div className="text-xs font-black text-zinc-100 truncate">
                        {orden.lavadorNombre ? (
                          `${orden.lavadorNombre} ${orden.lavadorApellido || ""}`
                        ) : (
                          <span className="text-amber-400 font-bold">⚠️ SIN ASIGNAR</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {orden.prioridad && orden.prioridad > 0 ? (
                    <Badge variant="outline" className="border-rose-500 bg-rose-500/10 text-rose-400 text-[10px] font-black px-2 py-0.5">
                      URGENTE
                    </Badge>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
