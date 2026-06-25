import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Car,
  Printer,
  Clock,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  XCircle,
  User,
  CarFront,
  Truck,
  Bike,
  ShieldCheck,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Orden, Lavador } from "./OrdenesTable";

interface UseOrdenesColumnsProps {
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
}

export function useOrdenesColumns({
  lavadores,
  onStatusChange,
  onAssignLavador,
}: UseOrdenesColumnsProps): ColumnDef<Orden>[] {
  return useMemo(() => [
    {
      accessorKey: "nroTicket",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted/50 dark:hover:bg-muted/50 font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Ticket
          <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => {
        const ord = row.original;
        
        // Formatear hora de creación
        const formatTime = (date: Date | null) => {
          if (!date) return "";
          const d = new Date(date);
          const hours = d.getHours();
          const minutes = d.getMinutes().toString().padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          return `${formattedHours}:${minutes} ${ampm}`;
        };

        return (
          <div className="flex flex-col gap-0.5 relative pl-3">
            {/* Indicador sutil de prioridad en el borde izquierdo del ticket */}
            {ord.prioridad === 1 && (
              <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-rose-500 rounded-full" />
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-foreground text-xs tracking-tight">
                #{ord.nroTicket || "---"}
              </span>
              {ord.prioridad === 1 && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[8px] font-black tracking-wider uppercase animate-pulse">
                  Express ⚡
                </span>
              )}
            </div>
            
            {/* Indicador de Comprobante SUNAT */}
            {ord.comprobanteTipo ? (
              <span className="self-start inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 px-1.5 py-0.2 rounded mt-0.5 select-none">
                {ord.comprobanteTipo === "boleta" ? "Bol" : "Fac"}: {ord.comprobanteSerie}-{ord.comprobanteNumero}
              </span>
            ) : ord.estado === "cobrado" ? (
              <span className="self-start inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-1.5 py-0.2 rounded mt-0.5 select-none">
                Nota de Venta
              </span>
            ) : null}

            {ord.createdAt && (
              <span 
                className="text-[9px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5"
                suppressHydrationWarning
              >
                <Clock className="h-2.5 w-2.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                {formatTime(ord.createdAt)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "placa",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Placa</span>,
      cell: ({ row }) => (
        <div className="inline-flex items-center bg-muted/65 dark:bg-muted/40 border border-border rounded px-1.5 py-0.5 shadow-2xs select-none font-mono">
          <div className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-650 mr-1 shadow-2xs" />
          <span className="text-[10px] font-bold text-foreground  uppercase">
            {row.getValue("placa")}
          </span>
        </div>
      ),
    },
    {
      id: "cliente_vehiculo",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cliente / Vehículo</span>,
      cell: ({ row }) => {
        const ord = row.original;
        const clienteNombreCompleto = `${ord.clienteNombre} ${ord.clienteApellido || ""}`.trim();
        const iniciales = ord.clienteNombre 
          ? `${ord.clienteNombre.slice(0, 1)}${ord.clienteApellido ? ord.clienteApellido.slice(0, 1) : ""}`.toUpperCase() 
          : "C";
          
        const getVehicleIcon = (tipo: string | null) => {
          switch (tipo) {
            case "suv": return <CarFront className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />;
            case "pickup": case "camion": case "furgon": return <Truck className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />;
            case "moto": return <Bike className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />;
            case "otro": return <Sparkles className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />;
            default: return <Car className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />;
          }
        };
        
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 dark:border-secondary/30 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-inner">
              {iniciales}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate max-w-[170px]">
                {clienteNombreCompleto}
              </div>
              <div className="text-[9.5px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                {getVehicleIcon(ord.vehiculoTipo)}
                <span className="truncate max-w-[145px]">
                  {ord.vehiculoMarca} {ord.vehiculoModelo}
                  {ord.vehiculoTipo && (
                    <span className="text-zinc-450 dark:text-zinc-500 font-normal ml-0.5">
                      ({ord.vehiculoTipo})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "servicios",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Servicios</span>,
      cell: ({ row }) => {
        const ord = row.original;
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-semibold text-[9px] bg-muted/65 text-muted-foreground px-1.5 py-0.2 rounded border border-border/80 shadow-3xs">
              Detalle en ticket
            </span>
            {ord.notas && (
              <span className="text-[8.5px] text-zinc-550 dark:text-zinc-400 italic truncate max-w-[130px]" title={ord.notas}>
                Nota: {ord.notas}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lavadorNombre",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Lavador Asignado</span>,
      cell: ({ row }) => {
        const ord = row.original;
        const isUnassigned = !ord.lavadorNombre;
        
        return (
          <Select
            value={
              lavadores.find(
                (l) =>
                  l.nombre === ord.lavadorNombre &&
                  l.apellido === ord.lavadorApellido
              )?.id || "unassigned"
            }
            onValueChange={(val: string | null) => onAssignLavador(ord.id, !val || val === "unassigned" ? null : val)}
          >
            <SelectTrigger 
              className={`rounded-lg text-[10px] h-7 px-2.5 select-none transition-all duration-150 outline-none w-52 shrink-0 ${
                isUnassigned
                  ? "border border-dashed border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/60"
                  : "border border-border bg-card/60 hover:bg-card/90 text-foreground hover:border-zinc-400 dark:hover:border-zinc-650"
              }`}
            >
              <SelectValue placeholder="Sin Asignar">
                {(val) => {
                  if (!val || val === "unassigned") return (
                    <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 min-w-0">
                      <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                      <span className="truncate">Sin Asignar</span>
                    </span>
                  );
                  const lavador = lavadores.find((l) => l.id === val);
                  const nombreCompleto = lavador ? `${lavador.nombre} ${lavador.apellido || ""}` : val;
                  return (
                    <span className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                      <User className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <span className="truncate">{nombreCompleto}</span>
                    </span>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-52 bg-card text-card-foreground border border-border shadow-md">
              <SelectItem value="unassigned" className="text-[10px]">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold min-w-0">
                  <span className="h-1 w-1 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="truncate">Sin Asignar</span>
                </span>
              </SelectItem>
              {lavadores.map((l) => (
                <SelectItem key={l.id} value={l.id} className="text-[10px]">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{l.nombre} {l.apellido}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "estado",
      header: () => <div className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Estado</div>,
      cell: ({ row }) => {
        const ord = row.original;
        
        // Configuración de visualización de estado
        const getEstadoConfig = (estado: Orden["estado"]) => {
          switch (estado) {
            case "pendiente":
              return {
                label: "Espera",
                icon: <Clock className="h-3 w-3 text-amber-500 shrink-0" />,
                style: "border-amber-500/25 text-amber-700 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/40",
              };
            case "en_proceso":
              return {
                label: "Lavando",
                icon: <Sparkles className="h-3 w-3 animate-pulse text-sky-500 shrink-0" />,
                style: "border-sky-500/25 text-sky-700 dark:text-sky-400 bg-sky-500/5 dark:bg-sky-500/10 hover:bg-sky-500/10 hover:border-sky-500/40",
              };
            case "completado":
              return {
                label: "Listo",
                icon: <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />,
                style: "border-emerald-500/25 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/40",
              };
            case "cobrado":
              return {
                label: "Cobrado",
                icon: <BadgeCheck className="h-3 w-3 text-zinc-500 dark:text-zinc-400 shrink-0" />,
                style: "border-border text-muted-foreground bg-muted/40 hover:bg-muted/70",
              };
            case "cancelado":
              return {
                label: "Cancelado",
                icon: <XCircle className="h-3 w-3 text-rose-500 shrink-0" />,
                style: "border-rose-500/25 text-rose-700 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10",
              };
          }
        };

        const config = getEstadoConfig(ord.estado);

        return (
          <div className="flex justify-center">
            <Select
              value={ord.estado}
              disabled={ord.estado === "cancelado"}
              onValueChange={(val: string | null) => val && onStatusChange(ord.id, val as any)}
            >
              <SelectTrigger
                className={`text-[10px] font-extrabold h-7 rounded-full px-2.5 border outline-none cursor-pointer w-28 justify-between select-none shadow-xs transition-all duration-200 shrink-0 ${config.style}`}
              >
                <span className="flex items-center gap-1 min-w-0">
                  {config.icon}
                  <span className="truncate">{config.label}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="w-36 bg-card text-card-foreground border border-border shadow-md">
                {ord.estado === "cobrado" ? (
                  <>
                    <SelectItem value="cobrado" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <BadgeCheck className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Cobrado</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelado" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                        <span>Anular / Reembolsar</span>
                      </span>
                    </SelectItem>
                  </>
                ) : ord.estado === "cancelado" ? (
                  <SelectItem value="cancelado" className="text-[10px]">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span>Cancelado</span>
                    </span>
                  </SelectItem>
                ) : (
                  <>
                    <SelectItem value="pendiente" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Espera</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="en_proceso" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                        <span>Lavando</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="completado" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Listo</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="cobrado" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <BadgeCheck className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Cobrado</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelado" className="text-[10px]">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                        <span>Cancelado</span>
                      </span>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted/50 dark:hover:bg-muted/50 font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Total
            <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-black text-foreground text-xs tracking-tight">
          S/ {parseFloat(row.getValue("total") || "0").toFixed(2)}
        </div>
      ),
    },
    {
      id: "acciones",
      header: () => <div className="text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acciones</div>,
      cell: ({ row }) => {
        const ord = row.original;
        return (
          <div className="flex justify-end gap-1.5">
            {/* Botón de Comprobante SUNAT (si está cobrado o completado) */}
            {(ord.estado === "cobrado" || ord.estado === "completado") && (
              <Link href={`/ordenes/${ord.id}/ticket`} passHref>
                <Button
                  variant="outline"
                  size="icon"
                  title={ord.comprobanteTipo ? "Ver Comprobante SUNAT registrado" : "Registrar Comprobante SUNAT"}
                  className={`h-7 w-7 cursor-pointer shadow-xs rounded-lg transition-all border ${
                    ord.comprobanteTipo
                      ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/30 hover:border-emerald-500/50"
                      : "text-amber-500 dark:text-amber-400 hover:text-amber-600 bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/30 hover:border-amber-500/50 animate-pulse"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            <Link href={`/ordenes/${ord.id}/ticket`} passHref>
              <Button
                variant="outline"
                size="icon"
                title="Ver detalle / Emitir Comprobante"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted border-border hover:border-zinc-400 dark:hover:border-zinc-650 cursor-pointer shadow-xs rounded-lg transition-all"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    title="Imprimir ticket..."
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted border-border hover:border-zinc-400 dark:hover:border-zinc-650 cursor-pointer shadow-xs rounded-lg transition-all"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="bg-card text-card-foreground border border-border shadow-md">
                <DropdownMenuItem
                  onClick={() => window.open(`/api/pdf/ticket/${ord.id}?mode=work`, "_blank")}
                  className="cursor-pointer text-[10.5px] font-bold flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Ticket Trabajo (Sin Precios)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`/api/pdf/ticket/${ord.id}`, "_blank")}
                  className="cursor-pointer text-[10.5px] font-bold flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Ticket Cliente (Con Precios)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [lavadores, onAssignLavador, onStatusChange]);
}
