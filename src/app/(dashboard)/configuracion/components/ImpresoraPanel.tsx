"use client";

import { useState } from "react";
import {
  Printer,
  Scissors,
  DollarSign,
  Image as ImageIcon,
  Copy,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  type ImpresoraConfig,
  type PresetImpresora,
  PRESETS_IMPRESORAS_PERU,
  DEFAULT_IMPRESORA_CONFIG,
} from "./impresora-types";

interface ImpresoraPanelProps {
  initialConfig?: Partial<ImpresoraConfig>;
  isPending: boolean;
  onSave: (config: ImpresoraConfig) => Promise<void>;
}

export function ImpresoraPanel({
  initialConfig,
  isPending,
  onSave,
}: ImpresoraPanelProps) {
  const [config, setConfig] = useState<ImpresoraConfig>({
    ...DEFAULT_IMPRESORA_CONFIG,
    ...initialConfig,
  });

  const handleSelectPreset = (preset: PresetImpresora) => {
    setConfig((prev) => ({
      ...prev,
      modeloPreset: preset.id,
      anchoPapel: preset.defaults.anchoPapel,
      autocorte: preset.defaults.autocorte,
      abrirCajon: preset.defaults.abrirCajon,
      mostrarLogo: preset.defaults.mostrarLogo,
      copias: preset.defaults.copias,
      copiaLavador: preset.defaults.copiaLavador,
      mensajePie: preset.defaults.mensajePie,
      densidadFuente: preset.defaults.densidadFuente,
    }));
  };

  const handlePrintTest = () => {
    const params = new URLSearchParams({
      ancho: config.anchoPapel,
      logo: String(config.mostrarLogo),
      copias: String(config.copias),
      preset: config.modeloPreset,
      pie: config.mensajePie,
    });
    window.open(`/api/pdf/ticket/test?${params.toString()}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Banner Superior Informativo y Test Print ───────────────────────── */}
      <Card className="p-5 sm:p-6 border-border/80 bg-linear-to-r from-card via-card to-secondary/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Printer className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                Impresoras Térmicas de Tickets (POS)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Calibra el formato de impresión para el ancho de tu bobina térmica (80mm o 58mm).
              Todos los modelos populares en Perú usan el protocolo estándar <strong>ESC/POS</strong>.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handlePrintTest}
            className="border-secondary/40 text-secondary hover:bg-secondary/10 font-semibold text-xs h-10 px-4 rounded-xl shrink-0 cursor-pointer shadow-xs gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Ticket de Prueba</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </div>
      </Card>

      {/* ── Selector de Modelos más Populares en Perú ────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-bold font-heading text-foreground">
              Modelos más recomendados en Perú
            </Label>
            <p className="text-xs text-muted-foreground">
              Selecciona tu marca para autoconfigurar las medidas y opciones recomendadas.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium border-border/80">
            {PRESETS_IMPRESORAS_PERU.length} opciones
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS_IMPRESORAS_PERU.map((preset) => {
            const isSelected = config.modeloPreset === preset.id;

            return (
              <button
                type="button"
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-secondary bg-secondary/5 dark:bg-secondary/10 shadow-xs ring-1 ring-secondary/30"
                    : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {preset.marca}
                    </span>
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className={`text-[10px] font-bold ${
                        isSelected
                          ? "bg-secondary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {preset.badge}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold font-heading text-foreground mb-1 leading-snug">
                    {preset.nombre}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {preset.descripcion}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-foreground/80">
                    Papel: {preset.anchoPapel}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-secondary font-bold text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Activo
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Parámetros Técnicos Detallados ──────────────────────────────────── */}
      <Card className="p-5 sm:p-6 border-border/80 space-y-6">
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground">
            Ajustes Técnicos de Bobina y Hardware
          </h3>
          <p className="text-xs text-muted-foreground">
            Puedes afinar estos valores independientemente del modelo seleccionado.
          </p>
        </div>

        {/* Ancho del papel */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ancho del Rollo de Papel
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, anchoPapel: "80mm" }))}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                config.anchoPapel === "80mm"
                  ? "border-secondary bg-secondary/5 ring-1 ring-secondary/30"
                  : "border-border/80 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold font-heading text-foreground">
                  80 mm (Estándar POS)
                </span>
                {config.anchoPapel === "80mm" && (
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recomendado para cajas fijas. Permite hasta 48 caracteres por línea con tabla de servicios detallada.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, anchoPapel: "58mm" }))}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                config.anchoPapel === "58mm"
                  ? "border-secondary bg-secondary/5 ring-1 ring-secondary/30"
                  : "border-border/80 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold font-heading text-foreground">
                  58 mm (Compacto / Portátil)
                </span>
                {config.anchoPapel === "58mm" && (
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Para terminales móviles de mano (Sunmi) o impresoras bluetooth portátiles con 32 columnas.
              </p>
            </button>
          </div>
        </div>

        {/* Copias de Impresión por Orden */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Copias de Impresión por Servicio
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({ ...prev, copias: 1, copiaLavador: false }))
              }
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                config.copias === 1
                  ? "border-secondary bg-secondary/5 ring-1 ring-secondary/30"
                  : "border-border/80 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold font-heading text-foreground">
                    1 Copia (Cliente)
                  </span>
                </div>
                {config.copias === 1 && (
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Emite únicamente el ticket de pago/entrega para el propietario del vehículo.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({ ...prev, copias: 2, copiaLavador: true }))
              }
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                config.copias === 2
                  ? "border-secondary bg-secondary/5 ring-1 ring-secondary/30"
                  : "border-border/80 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-bold font-heading text-foreground">
                    2 Copias (Cliente + Parabrisas)
                  </span>
                </div>
                {config.copias === 2 && (
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recomendado en autolavados: 1 ticket para el cliente y 1 orden de trabajo para el lavador en bahía.
              </p>
            </button>
          </div>
        </div>

        {/* Toggles de funciones de Hardware */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setConfig((prev) => ({ ...prev, autocorte: !prev.autocorte }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setConfig((prev) => ({ ...prev, autocorte: !prev.autocorte }));
              }
            }}
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 hover:border-border hover:bg-muted/20 transition-all cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">
                  Corte Automático de Papel (Autocut)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Activa la señal de guillotina para impresoras con cuchilla motorizada al finalizar el ticket.
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                id="autocorte-switch"
                checked={config.autocorte}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, autocorte: checked }))
                }
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setConfig((prev) => ({ ...prev, abrirCajon: !prev.abrirCajon }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setConfig((prev) => ({ ...prev, abrirCajon: !prev.abrirCajon }));
              }
            }}
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 hover:border-border hover:bg-muted/20 transition-all cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">
                  Apertura de Cajón Monedero (RJ11)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Envía el pulso eléctrico a la gaveta de dinero al cobrar servicios en efectivo.
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                id="cajon-switch"
                checked={config.abrirCajon}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, abrirCajon: checked }))
                }
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setConfig((prev) => ({ ...prev, mostrarLogo: !prev.mostrarLogo }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setConfig((prev) => ({ ...prev, mostrarLogo: !prev.mostrarLogo }));
              }
            }}
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 hover:border-border hover:bg-muted/20 transition-all cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">
                  Imprimir Logotipo de la Sucursal
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Incluye la imagen del logo en blanco y negro en la cabecera del ticket térmico.
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                id="logo-switch"
                checked={config.mostrarLogo}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, mostrarLogo: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Mensaje de pie de página */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="mensaje-pie" className="text-sm font-bold text-foreground">
              Mensaje en el Pie del Ticket
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Texto personalizado para agradecer, indicar claves de Wi-Fi, redes sociales o advertencias de entrega.
          </p>
          <Textarea
            id="mensaje-pie"
            rows={3}
            value={config.mensajePie}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, mensajePie: e.target.value }))
            }
            placeholder="¡Muchas gracias por su preferencia! Conserve este ticket para retirar su vehículo."
            className="text-xs font-mono resize-none border-border/80 focus-visible:ring-secondary/40"
          />
        </div>
      </Card>

      {/* ── Botón Guardar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-secondary text-white hover:bg-secondary/90 font-bold px-6 h-10 rounded-xl cursor-pointer shadow-sm gap-2"
        >
          {isPending ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Guardar Configuración de Impresora</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
