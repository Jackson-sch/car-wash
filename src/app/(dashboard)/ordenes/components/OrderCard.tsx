"use client";

import { useMemo } from "react";
import { Car, CarFront, Truck, Bike, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Orden, Lavador } from "./OrdenesTable";
import { TimeElapsed } from "./TimeElapsed";
import { formatCurrency } from "@/lib/formats";

const VEHICLE_ICONS: Record<string, React.ReactNode> = {
  sedan: <Car className="h-4 w-4 shrink-0" />,
  suv: <CarFront className="h-4 w-4 shrink-0" />,
  pickup: <Truck className="h-4 w-4 shrink-0" />,
  moto: <Bike className="h-4 w-4 shrink-0" />,
  camion: <Truck className="h-4 w-4 shrink-0" />,
  furgon: <Truck className="h-4 w-4 shrink-0" />,
  otro: <Sparkles className="h-4 w-4 shrink-0" />,
};

interface OrderCardProps {
  orden: Orden;
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
  isDragging?: boolean;
}

export function OrderCard({
  orden,
  lavadores,
  onStatusChange,
  onAssignLavador,
  isDragging = false,
}: OrderCardProps) {
  const Icon = VEHICLE_ICONS[orden.vehiculoTipo || "otro"] || VEHICLE_ICONS["otro"];
  
  const lavadorAsignado = useMemo(() => {
    return lavadores.find(l => l.nombre === orden.lavadorNombre && l.apellido === orden.lavadorApellido)?.id || "unassigned";
  }, [lavadores, orden.lavadorNombre, orden.lavadorApellido]);

  const getGradientClass = (estado: string) => {
    switch(estado) {
      case "pendiente": return "bg-gradient-to-br from-amber-500/10 via-card/90 to-card/80 border-amber-500/20";
      case "en_proceso": return "bg-gradient-to-br from-sky-500/10 via-card/90 to-card/80 border-sky-500/20";
      case "completado": return "bg-gradient-to-br from-emerald-500/10 via-card/90 to-card/80 border-emerald-500/20";
      default: return "bg-gradient-to-br from-card/90 to-muted/30 border-border/60";
    }
  };

  return (
    <Card 
      className={`flex flex-col gap-3 p-3 ${getGradientClass(orden.estado)} backdrop-blur-xl border shadow-[0_2px_4px_0_rgba(0,0,0,0.02)] transition-all duration-300 rounded-xl group w-full ${
        isDragging ? "opacity-50 border-secondary scale-105 shadow-xl ring-2 ring-secondary/50 cursor-grabbing" : "cursor-grab hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] hover:border-zinc-400/50"
      }`}
    >
      {/* Header: Plate & Timer */}
      <div className="flex items-center justify-between gap-2 overflow-hidden">
        <div className="inline-flex items-center px-2 py-0.5 bg-secondary/50 dark:bg-secondary/50 text-zinc-900 font-mono font-bold text-sm rounded border border-border shadow-sm uppercase tracking-wider shrink-0">
          {orden.placa}
        </div>
        <TimeElapsed createdAt={orden.createdAt} />
      </div>

      {/* Body: Details */}
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="font-extrabold text-sm text-zinc-900 leading-tight truncate">
          {orden.clienteNombre} {orden.clienteApellido}
        </h4>
        <div className="text-xs text-zinc-600 flex items-center gap-1.5 font-semibold min-w-0">
          {Icon}
          <span className="truncate">
            {orden.vehiculoMarca} {orden.vehiculoModelo}
          </span>
        </div>
      </div>

      {/* Select Lavador */}
      <div className="pt-2 border-t border-border/50">
        {/* OnDrag prevention on the Select to allow changing washer without dragging */}
        <div onPointerDown={(e) => e.stopPropagation()}>
          <Select
            value={lavadorAsignado}
            onValueChange={(val: string | null) => onAssignLavador(orden.id, !val || val === "unassigned" ? null : val)}
          >
            <SelectTrigger className="w-full h-8 text-xs bg-muted/40 border-border hover:border-zinc-400 focus:ring-secondary/20">
              <SelectValue placeholder="Asignar Lavador">
                {(val) => {
                  if (!val || val === "unassigned") return <span className="text-muted-foreground font-medium">Asignar Lavador</span>;
                  const l = lavadores.find(x => x.id === val);
                  return l ? <span className="font-bold text-foreground truncate">{l.nombre} {l.apellido}</span> : val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="unassigned" className="text-zinc-400">Sin Asignar</SelectItem>
              {lavadores.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold">{l.nombre} {l.apellido}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center justify-between gap-2 mt-1 min-w-0">
        <div className="font-black text-sm text-zinc-900 shrink-0">
          {formatCurrency(Number(orden.total) || 0)}
        </div>
        
        {/* Only show Payment button when completed, since moving forward is done via DND */}
        {orden.estado === "completado" && (
          <div className="w-full min-w-0" onPointerDown={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs font-bold w-full rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-border shadow-sm truncate"
              onClick={() => onStatusChange(orden.id, "cobrado")}
            >
              Registrar Pago
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
