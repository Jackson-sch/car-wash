"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Car, 
  Loader2, 
  CheckCircle2, 
  Star, 
  ShieldAlert, 
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { buscarVehiculoPorPlaca } from "@/lib/actions/clientes";
import { InspeccionVehiculoModal } from "./InspeccionVehiculoModal";
import type { VehiculoTipo } from "../hooks/useNuevaOrden";
import { toast } from "sonner";

interface VehiclePlateInputProps {
  placa: string;
  setPlaca: (v: string) => void;
  setVehiculoTipo: (v: VehiculoTipo) => void;
  vehiculoMarca: string;
  setVehiculoMarca: (v: string) => void;
  vehiculoModelo: string;
  setVehiculoModelo: (v: string) => void;
  vehiculoColor: string;
  setVehiculoColor: (v: string) => void;
  setClienteNombre: (v: string) => void;
  setClienteApellido: (v: string) => void;
  setClienteTelefono: (v: string) => void;
  setClienteEmail: (v: string) => void;
  inspeccionPuntos: { id: number; x: number; y: number; zona: string; tipo: string; nota: string }[];
  setInspeccionPuntos: (pts: { id: number; x: number; y: number; zona: string; tipo: string; nota: string }[]) => void;
  inspeccionNotas: string;
  setInspeccionNotas: (notas: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function VehiclePlateInput({
  placa,
  setPlaca,
  setVehiculoTipo,
  vehiculoMarca,
  setVehiculoMarca,
  vehiculoModelo,
  setVehiculoModelo,
  vehiculoColor,
  setVehiculoColor,
  setClienteNombre,
  setClienteApellido,
  setClienteTelefono,
  setClienteEmail,
  inspeccionPuntos,
  setInspeccionPuntos,
  inspeccionNotas,
  setInspeccionNotas,
  inputRef,
}: VehiclePlateInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [isInspeccionOpen, setIsInspeccionOpen] = useState(false);
  const [matchedCliente, setMatchedCliente] = useState<{
    nombre: string;
    apellido?: string | null;
    puntos?: number;
    placa: string;
  } | null>(null);

  const lastCheckedPlaca = useRef("");

  useEffect(() => {
    const clean = placa.trim().toUpperCase();

    if (clean === lastCheckedPlaca.current) return;

    const timer = setTimeout(async () => {
      if (clean.length < 3) {
        setMatchedCliente(null);
        setIsSearching(false);
        lastCheckedPlaca.current = clean;
        return;
      }

      setIsSearching(true);
      try {
        const res = await buscarVehiculoPorPlaca(clean);
        if (res) {
          lastCheckedPlaca.current = clean;
          setMatchedCliente({
            nombre: res.clienteNombre,
            apellido: res.clienteApellido,
            puntos: res.puntosAcumulados,
            placa: res.placa,
          });

          // Autocompletar datos del vehículo si están vacíos o nuevos
          if (res.tipo) setVehiculoTipo(res.tipo as VehiculoTipo);
          if (res.marca) setVehiculoMarca(res.marca);
          if (res.modelo) setVehiculoModelo(res.modelo);
          if (res.color) setVehiculoColor(res.color);

          // Autocompletar datos del cliente
          if (res.clienteNombre) setClienteNombre(res.clienteNombre);
          if (res.clienteApellido) setClienteApellido(res.clienteApellido);
          if (res.clienteTelefono) setClienteTelefono(res.clienteTelefono);
          if (res.clienteEmail) setClienteEmail(res.clienteEmail);

          toast.success(`Vehículo encontrado: ${res.placa}`, {
            description: `Cliente frecuente: ${res.clienteNombre} ${res.clienteApellido || ""}`,
          });
        } else {
          setMatchedCliente(null);
        }
      } catch (err) {
        console.error("Error buscando placa:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    placa,
    setVehiculoTipo,
    setVehiculoMarca,
    setVehiculoModelo,
    setVehiculoColor,
    setClienteNombre,
    setClienteApellido,
    setClienteTelefono,
    setClienteEmail,
  ]);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Encabezado con badge de atajo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <Car className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Vehículo & Placa
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Identificación y búsqueda rápida en base de datos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsInspeccionOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <ShieldAlert className="size-3.5 text-amber-500" />
            <span>Inspección de Daños</span>
            {inspeccionPuntos.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {inspeccionPuntos.length}
              </span>
            )}
          </Button>

          <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            Alt + L
          </span>
        </div>
      </div>

      {/* Input principal de placa con render de placa peruana interactiva */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-8 space-y-1.5">
          <Label htmlFor="placa-input" className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Número de Placa *</span>
            {isSearching && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-normal">
                <Loader2 className="size-3 animate-spin text-secondary" />
                Buscando...
              </span>
            )}
          </Label>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="placa-input"
              ref={inputRef}
              placeholder="EJ. ABC-123"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              maxLength={8}
              className="pl-10 h-12 bg-background border-border text-foreground font-mono font-black text-lg tracking-widest uppercase rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>
        </div>

        {/* Vista previa gráfica de la placa */}
        <div className="md:col-span-4 flex flex-col items-center sm:items-end justify-center pt-1 md:pt-4">
          <VehiclePlate
            plate={placa || "ABC-123"}
            country="PERÚ"
            size="md"
            copyable={false}
            className="shadow-xs hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* Banner de cliente recurrente si existe */}
      {matchedCliente && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Vehículo registrado a nombre de: <strong>{matchedCliente.nombre} {matchedCliente.apellido || ""}</strong>
            </span>
          </div>
          {matchedCliente.puntos !== undefined && matchedCliente.puntos > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {matchedCliente.puntos} pts
            </span>
          )}
        </div>
      )}

      {/* Detalles del vehículo en línea compacta (Marca, Modelo, Color) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="space-y-1">
          <Label htmlFor="vehiculo-marca" className="text-[11px] font-semibold text-muted-foreground">
            Marca (Ej. Toyota)
          </Label>
          <Input
            id="vehiculo-marca"
            placeholder="Toyota"
            value={vehiculoMarca}
            onChange={(e) => setVehiculoMarca(e.target.value)}
            className="h-9 text-xs bg-background border-border rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="vehiculo-modelo" className="text-[11px] font-semibold text-muted-foreground">
            Modelo (Ej. Corolla)
          </Label>
          <Input
            id="vehiculo-modelo"
            placeholder="Corolla / RAV4"
            value={vehiculoModelo}
            onChange={(e) => setVehiculoModelo(e.target.value)}
            className="h-9 text-xs bg-background border-border rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="vehiculo-color" className="text-[11px] font-semibold text-muted-foreground">
            Color (Ej. Negro / Plata)
          </Label>
          <Input
            id="vehiculo-color"
            placeholder="Gris Metálico"
            value={vehiculoColor}
            onChange={(e) => setVehiculoColor(e.target.value)}
            className="h-9 text-xs bg-background border-border rounded-lg"
          />
        </div>
      </div>

      {/* Modal de Inspección de Daños */}
      <InspeccionVehiculoModal
        isOpen={isInspeccionOpen}
        onClose={() => setIsInspeccionOpen(false)}
        initialNotas={inspeccionNotas}
        onSave={(data) => {
          setInspeccionPuntos(data.puntos);
          setInspeccionNotas(data.notasGeneral);
          if (data.puntos.length > 0) {
            toast.info(`Inspección guardada: ${data.puntos.length} hallazgo(s) marcados`);
          }
        }}
      />
    </div>
  );
}
