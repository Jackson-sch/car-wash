"use client";

import { useMemo, useCallback } from "react";
import {
  Car,
  CarFront,
  Truck,
  Bike,
  Sparkles,
  XCircle,
  Pencil,
  Eye,
  Printer,
  FileText,
  MessageCircle,
  Play,
  CheckCircle2,
  CreditCard,
  UserPlus,
  UserMinus,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Orden, Lavador } from "./OrdenesTable";
import { TimeElapsed } from "./TimeElapsed";
import { formatCurrency } from "@/lib/formats";
import { getWhatsAppIngresoUrl, getWhatsAppListoUrl } from "@/lib/whatsapp";

const VEHICLE_META: Record<
  string,
  { icon: React.ReactNode; label: string; badgeClass: string }
> = {
  sedan: {
    icon: <Car className="h-3.5 w-3.5 shrink-0" />,
    label: "Sedán",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  suv: {
    icon: <CarFront className="h-3.5 w-3.5 shrink-0" />,
    label: "SUV",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  pickup: {
    icon: <Truck className="h-3.5 w-3.5 shrink-0" />,
    label: "Pick-up",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  moto: {
    icon: <Bike className="h-3.5 w-3.5 shrink-0" />,
    label: "Moto",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  camion: {
    icon: <Truck className="h-3.5 w-3.5 shrink-0" />,
    label: "Camión",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  furgon: {
    icon: <Truck className="h-3.5 w-3.5 shrink-0" />,
    label: "Furgón",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  otro: {
    icon: <Sparkles className="h-3.5 w-3.5 shrink-0" />,
    label: "Vehículo",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

interface OrderCardProps {
  orden: Orden;
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
  onEdit?: (orden: Orden) => void;
  isDragging?: boolean;
}

export function OrderCard({
  orden,
  lavadores,
  onStatusChange,
  onAssignLavador,
  onEdit,
  isDragging = false,
}: OrderCardProps) {
  const meta = VEHICLE_META[orden.vehiculoTipo || "otro"] || VEHICLE_META.otro;

  const lavadorAsignado = useMemo(() => {
    return (
      lavadores.find(
        (l) => l.nombre === orden.lavadorNombre && l.apellido === orden.lavadorApellido
      )?.id || "unassigned"
    );
  }, [lavadores, orden.lavadorNombre, orden.lavadorApellido]);

  const getBorderAccent = useCallback((estado: string) => {
    switch (estado) {
      case "pendiente":
        return "border-amber-500/30 hover:border-amber-500/60";
      case "en_proceso":
        return "border-sky-500/30 hover:border-sky-500/60";
      case "completado":
        return "border-emerald-500/30 hover:border-emerald-500/60";
      default:
        return "border-border hover:border-zinc-400/50";
    }
  }, []);

  return (
    <Card
      className={`relative flex flex-col gap-3 p-3.5 bg-card/95 backdrop-blur-md border ${getBorderAccent(
        orden.estado
      )} shadow-sm transition-all duration-200 rounded-2xl group w-full ${
        isDragging
          ? "opacity-90 border-secondary scale-[1.02] shadow-2xl shadow-secondary/20 ring-2 ring-secondary/50 cursor-grabbing"
          : "cursor-grab hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
      }`}
    >
      {/* Barra superior: Placa Vehicular Peruana & Tiempo Transcurrido */}
      <div className="flex items-center justify-between gap-2">
        {/* Placa Automotriz en Color Sólido Mate (Sin reflejos) */}
        <div className="relative inline-flex flex-col items-center justify-center px-2.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-xs select-all shrink-0">
          <span className="text-[7.5px] font-black tracking-widest text-zinc-400 leading-none uppercase">
            PERÚ
          </span>
          <span className="text-xs sm:text-sm font-mono font-black tracking-wider text-zinc-100 leading-none mt-0.5">
            {orden.placa}
          </span>
        </div>

        {/* Tiempo transcurrido con semáforo dinámico */}
        <TimeElapsed createdAt={orden.createdAt} />
      </div>

      {/* Datos del Cliente y Vehículo */}
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="font-extrabold text-sm text-foreground leading-tight truncate">
          {orden.clienteNombre} {orden.clienteApellido}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium min-w-0">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${meta.badgeClass}`}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </span>
          <span className="truncate text-foreground/80 font-semibold">
            {orden.vehiculoMarca} {orden.vehiculoModelo}
          </span>
        </div>
      </div>

      {/* Asignación de Lavador */}
      <div className="pt-2 border-t border-border/50">
        <div onPointerDown={(e) => e.stopPropagation()}>
          <Select
            value={lavadorAsignado}
            onValueChange={(val: string | null) =>
              onAssignLavador(orden.id, !val || val === "unassigned" ? null : val)
            }
          >
            <SelectTrigger className="w-full h-8 text-xs bg-muted/40 hover:bg-muted/70 border border-border rounded-lg transition-colors focus:ring-1 focus:ring-secondary/30">
              <SelectValue placeholder="Asignar Lavador">
                {() => {
                  const lav = lavadores.find((x) => x.id === lavadorAsignado);
                  if (!lav) {
                    return (
                      <span className="text-muted-foreground/80 flex items-center gap-1.5 font-medium">
                        <UserPlus className="size-3.5 text-muted-foreground/60" />
                        <span>Sin lavador asignado</span>
                      </span>
                    );
                  }
                  return (
                    <span className="flex items-center gap-2 font-bold text-foreground truncate">
                      <span className="size-4.5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[10px] font-black shrink-0">
                        {lav.nombre.charAt(0)}
                      </span>
                      <span className="truncate">
                        {lav.nombre} {lav.apellido}
                      </span>
                    </span>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border shadow-xl">
              <SelectItem value="unassigned" className="text-muted-foreground text-xs">
                <span className="flex items-center gap-2">
                  <UserMinus className="size-3.5 text-muted-foreground" />
                  <span>Sin Asignar</span>
                </span>
              </SelectItem>
              {lavadores.map((l) => (
                <SelectItem
                  key={l.id}
                  value={l.id}
                  className="font-bold text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[9px] font-black">
                      {l.nombre.charAt(0)}
                    </span>
                    <span>
                      {l.nombre} {l.apellido}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Barra Inferior: Monto, Acciones Rápidas y Transición */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
        <div className="font-mono font-black text-sm text-foreground shrink-0">
          {formatCurrency(Number(orden.total) || 0)}
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Botón de Transición Rápida según la etapa */}
          {orden.estado === "pendiente" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(orden.id, "en_proceso")}
              className="h-7.5 px-2.5 text-[11px] font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg gap-1 shadow-xs cursor-pointer"
              title="Iniciar lavado en bahía"
            >
              <Play className="size-3 fill-current" />
              <span>Iniciar</span>
            </Button>
          )}

          {orden.estado === "en_proceso" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(orden.id, "completado")}
              className="h-7.5 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1 shadow-xs cursor-pointer"
              title="Marcar listo para entrega"
            >
              <CheckCircle2 className="size-3" />
              <span>Listo</span>
            </Button>
          )}

          {orden.estado === "completado" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(orden.id, "cobrado")}
              className="h-7.5 px-3 text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1 shadow-md shadow-emerald-950/20 cursor-pointer"
              title="Registrar cobro en caja"
            >
              <CreditCard className="size-3.5" />
              <span>Cobrar</span>
            </Button>
          )}

          {/* Menú de Notificación por WhatsApp */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer rounded-lg transition-colors"
                  title="WhatsApp al cliente"
                >
                  <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="bg-card text-card-foreground border border-border shadow-xl w-52 p-1.5 rounded-xl"
            >
              <DropdownMenuItem
                onClick={() => {
                  if (!orden.clienteTelefono) {
                    toast.error("El cliente no tiene teléfono celular registrado");
                    return;
                  }
                  const url = getWhatsAppIngresoUrl({
                    clienteNombre: orden.clienteNombre,
                    clienteTelefono: orden.clienteTelefono,
                    placa: orden.placa,
                    vehiculoMarca: orden.vehiculoMarca,
                    vehiculoModelo: orden.vehiculoModelo,
                    nroTicket: orden.nroTicket,
                    ordenId: orden.id,
                  });
                  if (url) window.open(url, "_blank");
                }}
                className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-2 rounded-lg"
              >
                <Car className="size-3.5 text-sky-500 shrink-0" />
                <span>Avisar Ingreso (Tracker)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!orden.clienteTelefono) {
                    toast.error("El cliente no tiene teléfono celular registrado");
                    return;
                  }
                  const url = getWhatsAppListoUrl({
                    clienteNombre: orden.clienteNombre,
                    clienteTelefono: orden.clienteTelefono,
                    placa: orden.placa,
                    vehiculoMarca: orden.vehiculoMarca,
                    vehiculoModelo: orden.vehiculoModelo,
                    total: orden.total,
                    nroTicket: orden.nroTicket,
                    ordenId: orden.id,
                  });
                  if (url) window.open(url, "_blank");
                }}
                className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-2 rounded-lg"
              >
                <Sparkles className="size-3.5 text-emerald-500 shrink-0" />
                <span>Avisar Auto Listo (Retiro)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de Más Acciones (Imprimir, Ver detalle, Editar, Cancelar) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg"
                  title="Más opciones"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="bg-card text-card-foreground border border-border shadow-xl w-52 p-1.5 rounded-xl"
            >
              <Link href={`/ordenes/${orden.id}/ticket`} passHref>
                <DropdownMenuItem className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-1.5 rounded-lg">
                  <Eye className="size-3.5 text-secondary shrink-0" />
                  <span>Ver Detalle / Ticket</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/api/pdf/ticket/${orden.id}`, "_blank")
                }
                className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-1.5 rounded-lg"
              >
                <Printer className="size-3.5 text-emerald-500 shrink-0" />
                <span>Imprimir Ticket Cliente</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/api/pdf/ticket/${orden.id}?mode=work`, "_blank")
                }
                className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-1.5 rounded-lg"
              >
                <FileText className="size-3.5 text-amber-500 shrink-0" />
                <span>Ticket de Lavador</span>
              </DropdownMenuItem>

              {orden.estado === "pendiente" && onEdit && (
                <>
                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                  <DropdownMenuItem
                    onClick={() => onEdit(orden)}
                    className="cursor-pointer text-xs font-semibold flex items-center gap-2 py-1.5 rounded-lg"
                  >
                    <Pencil className="size-3.5 text-muted-foreground shrink-0" />
                    <span>Editar Orden</span>
                  </DropdownMenuItem>
                </>
              )}

              {orden.estado !== "cobrado" &&
                orden.estado !== "cancelado" &&
                orden.estado !== "completado" && (
                  <>
                    <DropdownMenuSeparator className="my-1 bg-border/50" />
                    <DropdownMenuItem
                      onClick={() => onStatusChange(orden.id, "cancelado")}
                      className="cursor-pointer text-xs font-semibold text-rose-500 hover:text-rose-600 focus:text-rose-600 flex items-center gap-2 py-1.5 rounded-lg"
                    >
                      <XCircle className="size-3.5 shrink-0" />
                      <span>Cancelar Orden</span>
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
