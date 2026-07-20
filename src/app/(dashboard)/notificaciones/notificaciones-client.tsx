"use client";

import { useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { marcarNotificacionLeida, marcarTodasLeidas } from "@/lib/actions/notificaciones";
import { toast } from "sonner";

interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensaje: string | null;
  leida: boolean | null;
  metadata: unknown;
  createdAt: Date | null;
}

interface NotificacionesClientProps {
  initialNotificaciones: Notificacion[];
}

const TIPO_STYLE: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/30",
  },
  exito: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
  advertencia: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/30",
  },
  error: {
    icon: AlertTriangle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/30",
  },
  orden: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/20",
  },
  pago: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
};

export function NotificacionesClient({ initialNotificaciones }: NotificacionesClientProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(initialNotificaciones);
  const [filter, setFilter] = useState<"todas" | "noLeidas">("todas");

  const filtered = filter === "noLeidas"
    ? notificaciones.filter((n) => !n.leida)
    : notificaciones;

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const handleMarkRead = async (id: string) => {
    await marcarNotificacionLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await marcarTodasLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notificaciones
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Centro de notificaciones y alertas del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todas")}
            className="text-xs cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            Todas
          </Button>
          <Button
            variant={filter === "noLeidas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("noLeidas")}
            className="text-xs cursor-pointer relative"
          >
            No leídas
            {noLeidas > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[9px] h-4 px-1">
                {noLeidas}
              </Badge>
            )}
          </Button>
          {noLeidas > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs cursor-pointer">
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Leer todas
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-border bg-card">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {filter === "noLeidas" ? "No tienes notificaciones pendientes" : "No hay notificaciones"}
            </p>
          </Card>
        ) : (
          filtered.map((n) => {
            const style = TIPO_STYLE[n.tipo] || TIPO_STYLE.info;
            const Icon = style.icon;
            return (
              <div
                key={n.id}
                className={`rounded-xl border bg-card transition-all ${
                  n.leida ? "border-border opacity-70" : "border-border"
                } ${!n.leida ? "shadow-sm" : ""}`}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${style.bg} ${n.leida ? "opacity-50" : ""}`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-sm font-semibold ${n.leida ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.titulo}
                        </h4>
                        {n.mensaje && (
                          <p className={`text-xs mt-1 ${n.leida ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                            {n.mensaje}
                          </p>
                        )}
                      </div>
                      {!n.leida && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 cursor-pointer"
                          title="Marcar como leída"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-2" suppressHydrationWarning>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
