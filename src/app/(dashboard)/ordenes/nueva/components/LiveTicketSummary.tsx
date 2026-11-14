"use client";

import { useMemo } from "react";
import { 
  Receipt, 
  Clock, 
  User, 
  Tag, 
  X, 
  Loader2,
  Sparkles,
  Flame,
  Phone,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectItem, 
  SelectContent, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { formatCurrency } from "@/lib/formats";
import type { Servicio, Lavador, VehiculoTipo } from "../hooks/useNuevaOrden";

interface LiveTicketSummaryProps {
  placa: string;
  vehiculoTipo: VehiculoTipo;
  multiplier: number;
  clienteNombre: string;
  clienteApellido: string;
  clienteTelefono: string;
  servicios: Servicio[];
  serviciosSeleccionados: string[];
  onRemoveService: (id: string) => void;
  calculateServicePrice: (basePrice: string) => string;
  subtotal: number;
  total: number;
  totalDuracionMin: number;
  descuento: string;
  cuponCodigo: string;
  setCuponCodigo: (c: string) => void;
  cuponAplicado: { id: string; codigo: string; descuentoMonto: number } | null;
  onAplicarCupon: (c: string) => void;
  onRemoverCupon: () => void;
  lavadores: Lavador[];
  empleadoId: string;
  setEmpleadoId: (id: string) => void;
  prioridad: number;
  setPrioridad: (p: number) => void;
  notas: string;
  setNotas: (n: string) => void;
  isPending: boolean;
  cajaAbierta: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export function LiveTicketSummary({
  placa,
  vehiculoTipo,
  multiplier,
  clienteNombre,
  clienteApellido,
  clienteTelefono,
  servicios,
  serviciosSeleccionados,
  onRemoveService,
  calculateServicePrice,
  subtotal,
  total,
  totalDuracionMin,
  descuento,
  cuponCodigo,
  setCuponCodigo,
  cuponAplicado,
  onAplicarCupon,
  onRemoverCupon,
  lavadores,
  empleadoId,
  setEmpleadoId,
  prioridad,
  setPrioridad,
  notas,
  setNotas,
  isPending,
  cajaAbierta,
  onSubmit,
  onReset,
}: LiveTicketSummaryProps) {
  const selectedServicesList = useMemo(() => {
    return serviciosSeleccionados
      .map((id) => servicios.find((s) => s.id === id))
      .filter((s): s is Servicio => s !== undefined);
  }, [serviciosSeleccionados, servicios]);

  const canSubmit = cajaAbierta && placa.trim().length > 0 && clienteNombre.trim().length > 0 && selectedServicesList.length > 0;

  return (
    <div className="bg-card border-2 border-border/90 rounded-3xl p-5 shadow-xl relative flex flex-col justify-between space-y-4">
      {/* Decorative POS ticket header */}
      <div className="space-y-3 pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/20">
              <Receipt className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Ticket de Orden
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Resumen operativo en tiempo real
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            title="Limpiar orden y reiniciar formulario"
            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Placa & Tipo Banner */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">
              Vehículo Asignado
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-foreground capitalize">
                {vehiculoTipo}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary/20 text-secondary font-bold">
                x{multiplier.toFixed(1)}
              </span>
            </div>
          </div>

          <VehiclePlate
            plate={placa || "ABC-123"}
            size="sm"
            country="PERÚ"
            copyable={false}
          />
        </div>

        {/* Cliente chip */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <User className="size-3 text-secondary" />
            Cliente:
          </span>
          <div className="text-right">
            <span className="font-bold text-foreground truncate max-w-[170px] block">
              {clienteNombre ? `${clienteNombre} ${clienteApellido}` : "(Pendiente de nombre)"}
            </span>
            {clienteTelefono && (
              <span className="text-[10px] text-muted-foreground font-mono flex items-center justify-end gap-1">
                <Phone className="size-2.5" />
                {clienteTelefono}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Servicios en el Ticket */}
      <div className="space-y-2 flex-1 min-h-[140px] max-h-[260px] overflow-y-auto pr-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          <span>Servicios ({selectedServicesList.length})</span>
          {totalDuracionMin > 0 && (
            <span className="text-secondary flex items-center gap-1 font-semibold">
              <Clock className="size-3" />
              ~{totalDuracionMin} min en patio
            </span>
          )}
        </div>

        {selectedServicesList.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center space-y-1.5 my-2">
            <Sparkles className="size-6 text-muted-foreground/40 mx-auto" />
            <p className="text-xs font-semibold text-muted-foreground">
              Ningún servicio seleccionado
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              Haz clic en los servicios del catálogo para añadirlos a este ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedServicesList.map((s) => {
              const price = calculateServicePrice(s.precio);
              return (
                <div
                  key={`ticket-${s.id}`}
                  className="group p-2.5 rounded-xl bg-background border border-border/70 flex items-center justify-between gap-2 text-xs transition-colors hover:border-secondary/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate leading-tight">
                      {s.nombre}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-2.5" />
                      {s.duracionMin || 30} min
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-foreground">
                      {formatCurrency(parseFloat(price))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveService(s.id)}
                      title="Quitar servicio del ticket"
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parámetros Operativos Rápidos: Lavador & Prioridad */}
      <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5 text-xs">
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-foreground">
            Lavador Responsable
          </Label>
          <Select
            value={empleadoId || "unassigned"}
            onValueChange={(val: string | null) => setEmpleadoId(!val || val === "unassigned" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background border-border text-foreground rounded-xl text-xs h-9">
              <SelectValue placeholder="Sin asignar (A cola de espera)">
                {(val) => {
                  if (!val || val === "unassigned") return "Sin asignar (A cola de espera)";
                  const l = lavadores.find((item) => item.id === val);
                  return l ? `${l.nombre} ${l.apellido || ""}` : val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border border-border">
              <SelectItem value="unassigned">Sin asignar (A cola de espera)</SelectItem>
              {lavadores.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nombre} {l.apellido || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Prioridad:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPrioridad(0)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                prioridad === 0
                  ? "bg-secondary text-slate-950 shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setPrioridad(1)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                prioridad === 1
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="size-3" />
              Alta / VIP
            </button>
          </div>
        </div>

        {/* Campo de notas breves */}
        <div className="pt-1">
          <Input
            placeholder="Nota breve (ej. cuidado con retrovisor)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="h-8 text-xs bg-background border-border rounded-lg"
          />
        </div>
      </div>

      {/* Sección Cupón de Descuento */}
      <div className="space-y-1.5 pt-1">
        {cuponAplicado ? (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <Tag className="size-3.5" />
              <span>Cupón {cuponAplicado.codigo}: -S/ {cuponAplicado.descuentoMonto.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={onRemoverCupon}
              className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Código cupón (ej. BIENVENIDO)"
              value={cuponCodigo}
              onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
              className="h-8 text-xs uppercase font-mono bg-background border-border rounded-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAplicarCupon(cuponCodigo)}
              className="h-8 px-2.5 text-xs font-bold rounded-lg cursor-pointer"
            >
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {/* Resumen Financiero Final */}
      <div className="space-y-1.5 pt-2 border-t-2 border-dashed border-border/90 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {parseFloat(descuento) > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Descuento aplicado</span>
            <span>- {formatCurrency(parseFloat(descuento))}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-1">
          <span className="text-sm font-black uppercase tracking-wider text-foreground">
            Total a Pagar
          </span>
          <span className="text-2xl font-black text-secondary tracking-tight">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Botón Principal de Envío */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isPending}
          className="w-full h-12 bg-secondary hover:bg-sky-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 text-xs sm:text-sm group"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-slate-950" />
              <span>Registrando y Enviando a Patio...</span>
            </>
          ) : (
            <>
              <span>CREAR ORDEN Y ENVIAR A PATIO</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/20 text-slate-950 text-[10px] font-mono font-extrabold group-hover:scale-105 transition-transform">
                Ctrl + ↵
              </span>
            </>
          )}
        </Button>

        {/* Ayudas de validación */}
        {!canSubmit && (
          <p className="text-[10px] text-center text-amber-500 font-medium mt-2">
            {!cajaAbierta
              ? "Caja cerrada: abre turno para emitir órdenes."
              : !placa.trim()
              ? "Falta ingresar la placa del vehículo."
              : !clienteNombre.trim()
              ? "Falta ingresar el nombre del cliente."
              : "Selecciona al menos un servicio para continuar."}
          </p>
        )}
      </div>
    </div>
  );
}
