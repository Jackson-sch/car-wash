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
    const elem = document.documentElement as any;
    const doc = document as any;

    const isFullNow = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFullNow) {
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
        toast.error(res.error || "Ocurrió un error al cambiar estado");
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
      suppressHydrationWarning
      className={isFullscreen ? "fixed inset-0 z-[9999] bg-background p-6 md:p-8 overflow-y-auto w-screen h-screen space-y-6" : "space-y-6"}
    >
      {/* Header Kiosco TV */}
      <Card suppressHydrationWarning className="bg-card/80 backdrop-blur-md border-border p-5 md:p-6 shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-secondary/15 rounded-2xl border border-secondary/30 text-secondary shadow-sm">
              <Tv className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-2.5">
                Kiosco Live — Bahías de Lavado
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Monitor en tiempo real para taller • {timeStr || "--:--:--"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="bg-background/80 border border-border rounded-xl px-4 py-2 text-right shadow-sm">
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Estado de Bahías</span>
              <span className="text-sm md:text-base font-black text-emerald-400">
                {enProcesoList.length} Lavando • {pendientesList.length} En Cola
              </span>
            </div>

            <Button
              type="button"
              onClick={toggleFullscreen}
              className="h-10 px-4 font-bold text-xs gap-2 bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 rounded-xl cursor-pointer shadow-sm"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Salir Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Modo TV (Full Screen)
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid Principal de Bahías */}
      <div className="space-y-8">
        {/* 1. SECCIÓN: EN PROCESO (LAVANDO AHORA) */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            En Bahía de Lavado ({enProcesoList.length})
          </h2>

          {enProcesoList.length === 0 ? (
            <Card className="bg-card/50 border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground text-xs font-medium">
              No hay vehículos lavándose en este momento. Selecciona un auto de la cola para iniciar.
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
                    className={`bg-card/90 border-2 rounded-2xl p-5 shadow-lg transition-all relative overflow-hidden flex flex-col justify-between ${
                      isOverdue
                        ? "border-rose-500/80 bg-rose-950/20"
                        : isNearEnd
                        ? "border-amber-500/80 bg-amber-950/20"
                        : "border-emerald-500/80"
                    }`}
                  >
                    <div>
                      {/* Badge Placa Top */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-block font-black text-xl md:text-2xl tracking-widest bg-amber-400 text-amber-950 px-3 py-1 rounded-lg shadow-sm border border-amber-500/50 uppercase">
                            {ord.placa}
                          </span>
                          <p className="text-xs font-bold text-foreground mt-2 flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            {ord.vehiculoMarca} {ord.vehiculoModelo}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Ticket</span>
                          <span className="text-sm font-black text-foreground">#{ord.nroTicket || "S/N"}</span>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div className="my-3 py-2 border-y border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Cliente</span>
                        <p className="text-xs font-semibold text-foreground">
                          {ord.clienteNombre} {ord.clienteApellido || ""}
                        </p>
                      </div>

                      {/* Lavador + Cronómetro */}
                      <div className="flex justify-between items-center mb-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-4 w-4 text-secondary" />
                          <span className="text-foreground font-bold">
                            {ord.lavadorNombre ? `${ord.lavadorNombre} ${ord.lavadorApellido || ""}` : "Sin Asignar"}
                          </span>
                        </div>

                        <div className={`flex items-center gap-1 font-bold ${
                          isOverdue ? "text-rose-400 animate-pulse" : "text-emerald-400"
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span>{elapsedMins} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Finalización */}
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCambiarEstado(ord.id, "completado")}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm h-11 rounded-xl gap-2 cursor-pointer shadow-md shadow-emerald-950/40"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      FINALIZAR LAVADO
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. SECCIÓN: COLA DE ESPERA (PENDIENTES) */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En Cola de Espera ({pendientesList.length})
          </h2>

          {pendientesList.length === 0 ? (
            <Card className="bg-card/40 border border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
              No hay vehículos esperando en la cola.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pendientesList.map((ord) => (
                <Card
                  key={ord.id}
                  className="bg-card/80 border border-border rounded-xl p-4 flex flex-col justify-between hover:border-accent transition-all shadow-sm"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black tracking-widest bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded text-sm uppercase shadow-sm">
                        {ord.placa}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">#{ord.nroTicket || "S/N"}</span>
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      {ord.vehiculoMarca} {ord.vehiculoModelo}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {ord.clienteNombre} {ord.clienteApellido || ""}
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleCambiarEstado(ord.id, "en_proceso")}
                    className="mt-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs h-9 gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="h-4 w-4 fill-amber-950" />
                    INICIAR LAVADO
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 3. SECCIÓN: RECIÉMENTE COMPLETADOS (AVISO WHATSAPP) */}
        {completadosRecientes.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
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
                  <Card key={ord.id} className="bg-card/80 border border-border rounded-xl p-3 text-xs flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between font-bold text-foreground mb-1">
                        <span className="font-black">{ord.placa}</span>
                        <span className="text-emerald-400">S/ {totalNum.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{ord.clienteNombre}</p>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1.5 px-2 rounded-lg transition-all shadow-sm"
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
