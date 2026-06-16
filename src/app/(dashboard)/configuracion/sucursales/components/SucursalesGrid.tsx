"use client";

import { useTransition } from "react";
import { Building, MapPin, Phone, Mail, Hash, Pencil, Power, PowerOff, ShieldCheck, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { switchActiveBranch } from "@/lib/actions/branch-switcher";
import { toast } from "sonner";
import { SucursalItem } from "./types";

interface SucursalesGridProps {
  data: SucursalItem[];
  searchQuery: string;
  userSucursalId: string | null;
  onEdit: (sucursal: SucursalItem) => void;
  onToggleStatus: (id: string) => void;
  onSwitchSuccess: (newSucursalId: string) => void;
}

export function SucursalesGrid({
  data,
  searchQuery,
  userSucursalId,
  onEdit,
  onToggleStatus,
  onSwitchSuccess,
}: SucursalesGridProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitchBranch = (id: string) => {
    startTransition(async () => {
      const res = await switchActiveBranch(id);
      if (res.success) {
        toast.success(`Sucursal activa cambiada a: ${res.sucursalNombre}`);
        onSwitchSuccess(id);
        // Recargar la ventana para actualizar todos los contextos (órdenes, servicios, etc.)
        window.location.reload();
      } else {
        toast.error(res.error || "Error al cambiar de sucursal");
      }
    });
  };

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/35 animate-bounce duration-1000" />
        <p className="font-bold text-lg text-foreground">
          {searchQuery ? "Sin resultados para tu búsqueda" : "No hay sucursales registradas"}
        </p>
        <p className="text-xs mt-1 text-muted-foreground/70 max-w-sm mx-auto">
          {searchQuery
            ? "Intenta con otras palabras clave o limpia el filtro de búsqueda"
            : "No hay sucursales registradas en el sistema para esta empresa."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((s) => {
        const isCurrent = s.id === userSucursalId;
        return (
          <Card
            key={s.id}
            className={`group relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
              isCurrent
                ? "bg-gradient-to-br from-card via-card to-secondary/3 border-secondary/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ring-1 ring-secondary/20"
                : s.activa
                ? "bg-card hover:border-zinc-400/50 dark:hover:border-zinc-700/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-border/80"
                : "bg-muted/30 border-dashed border-border/60 opacity-85"
            }`}
          >
            {/* Top Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                    {s.nombre}
                  </h3>
                  {s.ruc && (
                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Hash className="h-3 w-3 shrink-0" />
                      RUC: {s.ruc}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                  {isCurrent && (
                    <Badge
                      variant="default"
                      className="text-[9px] font-extrabold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/25 shadow-xs"
                    >
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Actual
                      </span>
                    </Badge>
                  )}
                  <Badge
                    variant={s.activa ? "default" : "secondary"}
                    className={`text-[9px] font-extrabold tracking-wider uppercase ${
                      s.activa
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                    }`}
                  >
                    {s.activa ? (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activa
                      </span>
                    ) : (
                      "Inactiva"
                    )}
                  </Badge>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs font-semibold text-muted-foreground/90">
                {s.direccion && (
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-secondary shrink-0" />
                    <span className="truncate" title={s.direccion}>
                      {s.direccion}
                    </span>
                  </div>
                )}
                {s.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>{s.telefono}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span className="truncate" title={s.email}>
                      {s.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
              {/* Switch branch button */}
              <div>
                {!isCurrent && s.activa && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSwitchBranch(s.id)}
                    className="h-8 text-[11px] font-bold rounded-lg border-border hover:border-zinc-350 hover:bg-muted/50 gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="h-3 w-3 text-secondary fill-secondary" />
                    Trabajar Aquí
                  </Button>
                )}
              </div>

              {/* Actions group */}
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/40 ml-auto opacity-90 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(s)}
                  className="h-8 w-8 rounded-lg hover:bg-card hover:text-primary transition-all cursor-pointer"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(s.id)}
                  disabled={isCurrent}
                  className={`h-8 w-8 rounded-lg hover:bg-card transition-all cursor-pointer ${
                    isCurrent && "cursor-not-allowed opacity-50"
                  }`}
                  title={
                    isCurrent
                      ? "No puedes desactivar tu sucursal activa actual"
                      : s.activa
                      ? "Desactivar"
                      : "Activar"
                  }
                >
                  {s.activa ? (
                    <PowerOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Power className="h-4 w-4 text-emerald-500" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
