"use client";

import { useState, useEffect } from "react";
import {
  Car,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  RefreshCw,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface OrdenConsulta {
  id: string;
  nroTicket: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: string | null;
  createdAt: string;
  updatedAt: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  clienteNombre: string;
  clienteTelefono: string | null;
  sucursalNombre: string;
  sucursalDireccion: string | null;
  sucursalTelefono: string | null;
}

const CONSULTA_STEPS = [
  {
    key: "pendiente",
    title: "En Cola de Espera",
    desc: "Tu vehículo ha ingresado a la recepción y aguarda turno de lavado.",
    icon: Clock,
  },
  {
    key: "en_proceso",
    title: "Lavando en Bahía",
    desc: "Nuestros operarios están realizando el servicio de autolavado.",
    icon: Sparkles,
  },
  {
    key: "completado",
    title: "Listo para Retiro",
    desc: "¡Tu auto está reluciente y esperándote en la zona de entrega!",
    icon: CheckCircle2,
  },
];

export function ConsultaClient({ orden }: { orden: OrdenConsulta }) {
  const [lastRefresh, setLastRefresh] = useState<string>("");

  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const getStepStatus = (stepEstado: "pendiente" | "en_proceso" | "completado") => {
    const ordenEstados = ["pendiente", "en_proceso", "completado"];
    const currentIndex = ordenEstados.indexOf(orden.estado === "cobrado" ? "completado" : orden.estado);
    const stepIndex = ordenEstados.indexOf(stepEstado);

    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "active";
    return "pending";
  };

  return (
    <div className="min-h-dvh bg-background text-foreground p-4 sm:p-6 md:p-10 font-sans flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            {orden.sucursalNombre}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            Estado de tu Vehículo
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Ticket #{orden.nroTicket} • Actualizado {lastRefresh || "--:--"}
          </p>
        </div>

        {/* Card Placa Destacada */}
        <Card className="bg-card/90 border-border p-6 shadow-xl rounded-2xl text-center space-y-4">
          <span className="inline-block bg-amber-400 text-amber-950 font-black text-3xl tracking-widest px-6 py-2 rounded-xl shadow-md border-2 border-amber-500/60 uppercase">
            {orden.placa}
          </span>
          <div className="text-sm font-bold text-foreground">
            <Car className="h-4 w-4 inline-block mr-1.5 text-muted-foreground" />
            {orden.marca} {orden.modelo}
          </div>

          <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
            orden.estado === 'completado' || orden.estado === 'cobrado'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : orden.estado === 'en_proceso'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse'
              : 'bg-secondary/15 border-secondary/40 text-secondary'
          }`}>
            {orden.estado === 'en_proceso' && (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> LAVANDO EN BAHÍA
              </span>
            )}
            {orden.estado === 'pendiente' && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> EN COLA DE ESPERA
              </span>
            )}
            {(orden.estado === 'completado' || orden.estado === 'cobrado') && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> LISTO PARA RETIRO
              </span>
            )}
          </div>
        </Card>

        {/* Timeline Progress */}
        <Card className="bg-card/80 border-border p-6 shadow-md rounded-2xl space-y-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Progreso del Servicio</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Actualizar
            </button>
          </h2>

          <div className="space-y-6 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
            {CONSULTA_STEPS.map((st) => {
              const state = getStepStatus(st.key as "pendiente" | "en_proceso" | "completado");
              const Icon = st.icon;

              return (
                <div key={st.key} className="flex items-start gap-4 relative z-10">
                  <div className={`p-2.5 rounded-full border shadow-sm transition-colors ${
                    state === 'completed'
                      ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-bold'
                      : state === 'active'
                      ? 'bg-amber-400 text-amber-950 border-amber-500 animate-bounce'
                      : 'bg-card text-muted-foreground border-border'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-tight ${
                      state === 'completed'
                        ? 'text-emerald-400'
                        : state === 'active'
                        ? 'text-amber-400'
                        : 'text-muted-foreground'
                    }`}>
                      {st.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Footer Contact */}
        <div className="bg-card/40 border border-border p-4 rounded-xl text-center space-y-2 text-xs">
          <p className="font-bold text-foreground flex items-center justify-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            {orden.sucursalNombre}
          </p>
          {orden.sucursalDireccion && (
            <p className="text-muted-foreground text-[11px]">{orden.sucursalDireccion}</p>
          )}

          {(orden.estado === "completado" || orden.estado === "cobrado") && (
            <div className="pt-2">
              <a
                href={`/evaluacion/${orden.nroTicket}`}
                className="inline-flex items-center justify-center gap-1.5 w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors border border-amber-400"
              >
                <Star className="h-4 w-4 fill-amber-950 text-amber-950" />
                Calificar mi Servicio de Lavado
              </a>
            </div>
          )}

          {orden.sucursalTelefono && (
            <div className="pt-1">
              <a
                href={`https://wa.me/${orden.sucursalTelefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Contactar Sucursal por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-[10px] text-muted-foreground font-semibold mt-8">
        WashMaster Pro • Software de Gestión de Autolavados
      </div>
    </div>
  );
}
