"use client";

import { Package, Check, X, Infinity, MapPin, Users, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

const FEATURE_LABELS: Record<string, string> = {
  ordenes: "Órdenes de Servicio",
  clientes: "Clientes",
  vehiculos: "Vehículos",
  reportes: "Reportes",
  inventario: "Inventario",
  cupones: "Cupones",
  empleados: "Empleados",
  soporte_prioritario: "Soporte Prioritario",
};

interface PlanItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  limiteSucursales: number | null;
  limiteUsuarios: number | null;
  features: Record<string, boolean>;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanCardProps {
  plan: PlanItem;
  onEdit: (plan: PlanItem) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const isFree = parseFloat(plan.precio) === 0;

  const formatLimit = useCallback((val: number | null) => {
    if (val === null) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Infinity className="size-3.5" />
          Ilimitado
        </span>
      );
    }
    return val;
  }, []);

  return (
    <Card className={`relative overflow-hidden border border-border bg-card/60 backdrop-blur-md hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 rounded-2xl flex flex-col justify-between ${
      !plan.activo ? "opacity-75 dark:opacity-65" : ""
    }`}>
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 bottom-1/3 h-24 w-24 rounded-full bg-primary/3 blur-2xl pointer-events-none" />

      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
              <Package className="size-5" />
            </div>
            <Badge className={`border-0 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
              plan.activo
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}>
              {plan.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-foreground">{plan.nombre}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="text-[9px] font-mono bg-muted/65 text-muted-foreground px-1.5 py-0.5 rounded">{plan.codigo}</code>
            </div>
          </div>
          {plan.descripcion && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{plan.descripcion}</p>
          )}
        </div>

        <div className="py-4 border-t border-b border-border/50 my-2">
          <div className="flex items-baseline gap-1">
            {isFree ? (
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Gratuito</span>
            ) : (
              <>
                <span className="text-xs font-bold text-muted-foreground mr-0.5">S/</span>
                <span className="text-3xl font-black tracking-tight text-foreground">{parseFloat(plan.precio).toFixed(2)}</span>
                <span className="text-xs text-muted-foreground font-semibold"> /mes</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Límites del Plan</div>
          <div className="flex items-center gap-2 text-muted-foreground font-semibold">
            <MapPin className="size-3.5 text-secondary" />
            <span>Sucursales: {formatLimit(plan.limiteSucursales)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-semibold">
            <Users className="size-3.5 text-secondary" />
            <span>Usuarios: {formatLimit(plan.limiteUsuarios)}</span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs border-t border-border/50 pt-4 mt-2">
          <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Características</div>
          <div className="space-y-1.5">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => {
              const hasFeature = plan.features[key];
              return (
                <div key={key} className="flex items-center gap-2.5 text-muted-foreground">
                  {hasFeature ? (
                    <Check className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="size-4 text-rose-500/60 shrink-0" />
                  )}
                  <span className={`text-xs ${hasFeature ? "text-foreground font-bold" : "line-through opacity-40 font-medium"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/40 border-t border-border/50 flex items-center justify-end gap-1.5">
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}
          className="h-8 text-[10px] font-bold rounded-lg border-border hover:border-zinc-350 hover:bg-muted/50 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shadow-xs px-3">
          <Pencil className="size-3.5" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(plan.id)}
          className="h-8 text-[10px] font-bold rounded-lg border-border hover:border-destructive hover:bg-destructive/5 hover:text-destructive gap-1.5 cursor-pointer text-muted-foreground shadow-xs px-3">
          <Trash2 className="size-3.5" />
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
