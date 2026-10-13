"use client";

import { useState, useEffect, startTransition } from "react";
import { Car, User, Loader2, CheckCircle2, AlertCircle, Star, ShieldAlert, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { buscarVehiculoPorPlaca } from "@/lib/actions/clientes";
import { toast } from "sonner";
import { InspeccionVehiculoModal } from "./InspeccionVehiculoModal";

type VehiculoTipo = "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";

interface PasoVehiculoClienteProps {
  placa: string;
  setPlaca: (v: string) => void;
  vehiculoTipo: VehiculoTipo;
  setVehiculoTipo: (v: VehiculoTipo) => void;
  vehiculoMarca: string;
  setVehiculoMarca: (v: string) => void;
  vehiculoModelo: string;
  setVehiculoModelo: (v: string) => void;
  vehiculoColor: string;
  setVehiculoColor: (v: string) => void;
  clienteNombre: string;
  setClienteNombre: (v: string) => void;
  clienteApellido: string;
  setClienteApellido: (v: string) => void;
  clienteTelefono: string;
  setClienteTelefono: (v: string) => void;
  clienteEmail: string;
  setClienteEmail: (v: string) => void;
  sucursalConfig: { multipliers?: Record<string, number> };
}

const defaultMultipliers: Record<string, number> = {
  sedan: 1.0,
  suv: 1.2,
  pickup: 1.4,
  moto: 0.8,
  camion: 2.0,
  furgon: 1.8,
  otro: 1.0,
};

const VEHICULOS_TYPES = [
  { id: "sedan", label: "Sedán" },
  { id: "suv", label: "SUV" },
  { id: "pickup", label: "Pick-up / Camioneta" },
  { id: "moto", label: "Moto" },
  { id: "camion", label: "Camión" },
  { id: "furgon", label: "Furgón / Van" },
  { id: "otro", label: "Otro" },
];

// react-doctor-disable-next-line no-giant-component
export function PasoVehiculoCliente({
  placa,
  setPlaca,
  vehiculoTipo,
  setVehiculoTipo,
  vehiculoMarca,
  setVehiculoMarca,
  vehiculoModelo,
  setVehiculoModelo,
  vehiculoColor,
  setVehiculoColor,
  clienteNombre,
  setClienteNombre,
  clienteApellido,
  setClienteApellido,
  clienteTelefono,
  setClienteTelefono,
  clienteEmail,
  setClienteEmail,
  sucursalConfig,
}: PasoVehiculoClienteProps) {
  
  interface VehiculoSearchResult {
    placa: string;
    tipo: string | null;
    marca: string | null;
    modelo: string | null;
    color: string | null;
    clienteNombre: string;
    clienteApellido: string | null;
    clienteTelefono: string | null;
    clienteEmail: string | null;
    puntosAcumulados?: number;
  }

  const [isSearching, setIsSearching] = useState(false);
  const [vehiculoEncontrado, setVehiculoEncontrado] = useState<VehiculoSearchResult | null>(null);
  const [lastAutoFilledPlaca, setLastAutoFilledPlaca] = useState("");
  const [isInspeccionOpen, setIsInspeccionOpen] = useState(false);
  const [inspeccionNotas, setInspeccionNotas] = useState("");

  const dbMultipliers = sucursalConfig.multipliers || {};

  useEffect(() => {
    const cleanPlaca = placa.trim();
    if (cleanPlaca.length < 3) {
      startTransition(() => {
        setVehiculoEncontrado(null);
        setIsSearching(false);
        setLastAutoFilledPlaca("");
      });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await buscarVehiculoPorPlaca(cleanPlaca);
        if (res) {
          setVehiculoEncontrado(res);
          if (cleanPlaca !== lastAutoFilledPlaca) {
            setVehiculoTipo((res.tipo ?? "sedan") as VehiculoTipo);
            setVehiculoMarca(res.marca || "");
            setVehiculoModelo(res.modelo || "");
            setVehiculoColor(res.color || "");
            setClienteNombre(res.clienteNombre);
            setClienteApellido(res.clienteApellido || "");
            setClienteTelefono(res.clienteTelefono || "");
            setClienteEmail(res.clienteEmail || "");
            
            setLastAutoFilledPlaca(cleanPlaca);
            toast.success(`Cliente encontrado: ${res.clienteNombre} ${res.clienteApellido || ""}`, {
              description: `Placa ${res.placa} auto-completada con éxito.`
            });
          }
        } else {
          setVehiculoEncontrado(null);
        }
      } catch (error) {
        console.error("Error al buscar placa:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    placa,
    lastAutoFilledPlaca,
    setVehiculoTipo,
    setVehiculoMarca,
    setVehiculoModelo,
    setVehiculoColor,
    setClienteNombre,
    setClienteApellido,
    setClienteTelefono,
    setClienteEmail
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300">
      {/* Vehículo Card */}
      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Car className="size-5 text-secondary" />
          Detalles del Vehículo
        </h2>

        <div className="space-y-2">
          <Label htmlFor="placa" className="text-xs font-bold text-foreground">
            Número de Placa *
          </Label>
          <Input
            id="placa"
            placeholder="Ej. ABC-123"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            required
            className="bg-card border-border focus:border-secondary font-mono font-black tracking-widest text-sm sm:text-base h-11 rounded-xl text-foreground uppercase"
          />
          
          {/* Indicadores de Búsqueda */}
          <div className="min-h-[20px] flex items-center mt-1">
            {isSearching && (
              <p className="text-xs text-muted-foreground animate-pulse flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin text-secondary" />
                Buscando placa en el sistema...
              </p>
            )}
            {!isSearching && vehiculoEncontrado && (
              <div className="space-y-1">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 transition-opacity duration-300">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Vehículo registrado — Cliente: {vehiculoEncontrado.clienteNombre} {vehiculoEncontrado.clienteApellido || ""}
                </p>
                {vehiculoEncontrado.puntosAcumulados !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs font-bold text-amber-500 dark:text-amber-400">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    Saldo: {vehiculoEncontrado.puntosAcumulados} Puntos de Fidelidad
                  </span>
                )}
              </div>
            )}
            {!isSearching && !vehiculoEncontrado && placa.trim().length >= 3 && (
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 transition-opacity duration-300">
                <AlertCircle className="size-3.5 text-muted-foreground" />
                Vehículo nuevo (se registrará automáticamente)
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">Tipo de Vehículo *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VEHICULOS_TYPES.map((v) => {
              const multiplier = dbMultipliers[v.id] ?? defaultMultipliers[v.id] ?? 1.0;
              const isSelected = vehiculoTipo === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehiculoTipo(v.id as VehiculoTipo)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors transition-transform cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-secondary/15 border-secondary text-secondary ring-1 ring-secondary/40 shadow-xs font-black"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-zinc-400/70 dark:hover:border-zinc-600/70"
                  }`}
                >
                  {v.label}
                  <span className="block text-[10px] text-muted-foreground font-medium mt-0.5">
                    (x{multiplier.toFixed(1)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="marca" className="text-xs font-bold text-muted-foreground">
              Marca
            </Label>
            <Input
              id="marca"
              placeholder="Toyota"
              value={vehiculoMarca}
              onChange={(e) => setVehiculoMarca(e.target.value)}
              className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-9 rounded-lg text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="modelo" className="text-xs font-bold text-muted-foreground">
              Modelo
            </Label>
            <Input
              id="modelo"
              placeholder="Corolla"
              value={vehiculoModelo}
              onChange={(e) => setVehiculoModelo(e.target.value)}
              className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-9 rounded-lg text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="color" className="text-xs font-bold text-muted-foreground">
              Color
            </Label>
            <Input
              id="color"
              placeholder="Negro"
              value={vehiculoColor}
              onChange={(e) => setVehiculoColor(e.target.value)}
              className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-9 rounded-lg text-foreground"
            />
          </div>
        </div>

        {/* Botón Inspección de Daños */}
        <div className="pt-2 border-t border-border/50">
          <Button
            type="button"
            onClick={() => setIsInspeccionOpen(true)}
            className={`w-full h-10 rounded-xl text-xs font-bold gap-2 transition-colors shadow-sm cursor-pointer border ${
              inspeccionNotas
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-500/60"
            }`}
          >
            <ShieldAlert className={`h-4 w-4 ${inspeccionNotas ? "text-emerald-400" : "text-amber-400"}`} />
            <span>
              {inspeccionNotas ? "✓ Inspección de Daños Registrada" : "Registrar Inspección de Daños (Rayones / Abolladuras)"}
            </span>
          </Button>
        </div>
      </Card>

      <InspeccionVehiculoModal
        isOpen={isInspeccionOpen}
        onClose={() => setIsInspeccionOpen(false)}
        onSave={({ puntos, notasGeneral }) => {
          const notasStr = `[INS PUNTOS: ${puntos.length}] ${puntos.map(p => `${p.zona}: ${p.tipo}`).join(", ")} ${notasGeneral ? `| ${notasGeneral}` : ""}`;
          setInspeccionNotas(notasStr);
          toast.success("Inspección de vehículo registrada correctamente.");
        }}
      />

      {/* Cliente Card */}
      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <User className="size-5 text-secondary" />
          Información del Cliente
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cNombre" className="text-xs font-bold text-foreground">
              Nombres *
            </Label>
            <Input
              id="cNombre"
              placeholder="Carlos"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              required
              className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-10 rounded-xl text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cApellido" className="text-xs font-bold text-foreground">
              Apellidos
            </Label>
            <Input
              id="cApellido"
              placeholder="Gómez"
              value={clienteApellido}
              onChange={(e) => setClienteApellido(e.target.value)}
              className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-10 rounded-xl text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cTel" className="text-xs font-bold text-foreground">
            Teléfono Celular
          </Label>
          <Input
            id="cTel"
            type="tel"
            placeholder="987654321"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-10 rounded-xl text-foreground font-mono"
          />
          <p className="text-[10px] text-muted-foreground font-medium">
            Si ingresa un celular registrado, el sistema completará los datos del cliente automáticamente.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cEmail" className="text-xs font-bold text-foreground">
            Correo Electrónico
          </Label>
          <Input
            id="cEmail"
            type="email"
            placeholder="cliente@correo.com"
            value={clienteEmail}
            onChange={(e) => setClienteEmail(e.target.value)}
            className="bg-card border-border focus:border-secondary text-xs sm:text-sm h-10 rounded-xl text-foreground"
          />
        </div>

        {/* Info card / Beneficios de Fidelidad */}
        <div className="pt-2">
          {vehiculoEncontrado ? (
            <div className="p-3 rounded-xl border border-secondary/30 bg-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star className="size-4.5 text-amber-500 fill-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Cliente Registrado</p>
                  <p className="text-[10px] text-muted-foreground">Datos cargados desde la base de datos</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {vehiculoEncontrado.puntosAcumulados ?? 0} pts
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4 text-secondary shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Los clientes acumulan puntos de lealtad automáticamente por cada orden de lavado.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
