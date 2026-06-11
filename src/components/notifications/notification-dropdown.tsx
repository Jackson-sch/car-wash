"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotificacionesNoLeidas, marcarNotificacionLeida, marcarTodasLeidas } from "@/lib/actions/notificaciones";
import { usePathname } from "next/navigation";

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

const TIPO_ICON: Record<string, typeof Info> = {
  info: Info,
  exito: CheckCircle,
  advertencia: AlertTriangle,
  error: AlertTriangle,
  orden: Info,
  pago: CheckCircle,
};

const TIPO_COLOR: Record<string, string> = {
  info: "text-blue-500",
  exito: "text-emerald-500",
  advertencia: "text-amber-500",
  error: "text-rose-500",
  orden: "text-primary",
  pago: "text-emerald-500",
};

export function NotificationDropdown() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    loadNotificaciones();
  }, []);

  // Refresh on path change (e.g. after redirect from creating an order)
  useEffect(() => {
    loadNotificaciones();
  }, [pathname]);

  const loadNotificaciones = async () => {
    const data = await getNotificacionesNoLeidas();
    setNotificaciones(data);
  };

  const handleMarkRead = async (id: string) => {
    await marcarNotificacionLeida(id);
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await marcarTodasLeidas();
    setNotificaciones([]);
  };

  const noLeidas = notificaciones.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl cursor-pointer"
        />
      }>
        <Bell className="h-4.5 w-4.5" />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-secondary text-secondary-foreground text-[8px] font-bold flex items-center justify-center shadow-sm shadow-secondary/30">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95"
      >
        <DropdownMenuLabel className="font-bold px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Notificaciones</span>
          {noLeidas > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" />
              Leer todas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40 my-1" />

        {notificaciones.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No hay notificaciones pendientes</p>
          </div>
        ) : (
          notificaciones.slice(0, 5).map((n) => {
            const Icon = TIPO_ICON[n.tipo] || Info;
            const color = TIPO_COLOR[n.tipo] || "text-muted-foreground";
            return (
              <DropdownMenuItem
                key={n.id}
                className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg flex items-start gap-3"
                onClick={() => handleMarkRead(n.id)}
              >
                <div className={`mt-0.5 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{n.titulo}</p>
                  {n.mensaje && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.mensaje}</p>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {n.createdAt ? timeAgo(new Date(n.createdAt)) : ""}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}

        <DropdownMenuSeparator className="bg-border/40 my-1" />
        <Link href="/notificaciones" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold text-primary flex items-center justify-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver todas las notificaciones
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hace segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}
