"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  Receipt,
  Calendar,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  X,
  Landmark,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProveedorAutocompleteItem } from "../../types";

interface ProveedorDocCardProps {
  proveedores: ProveedorAutocompleteItem[];
  proveedorId: string | null;
  setProveedorId: (val: string | null) => void;
  proveedorNombre: string;
  setProveedorNombre: (val: string) => void;
  proveedorRuc: string;
  setProveedorRuc: (val: string) => void;
  proveedorTelefono: string;
  setProveedorTelefono: (val: string) => void;
  proveedorDireccion: string;
  setProveedorDireccion: (val: string) => void;
  tipoComprobante: string;
  setTipoComprobante: (val: string) => void;
  numeroComprobante: string;
  setNumeroComprobante: (val: string) => void;
  fechaEmision: string;
  setFechaEmision: (val: string) => void;
  metodoPago: string;
  setMetodoPago: (val: string) => void;
}

const TIPO_DOC_LABELS: Record<string, string> = {
  factura: "Factura Electrónica",
  boleta: "Boleta de Venta",
  guia: "Guía de Remisión",
  nota: "Nota de Venta / Recibo",
};

const METODO_PAGO_LABELS: Record<string, string> = {
  transferencia: "Transferencia Bancaria",
  efectivo: "Efectivo (Gaveta de Turno)",
  tarjeta: "Tarjeta Débito / Crédito",
  credito: "Crédito Comercial (30 Días)",
};

export function ProveedorDocCard({
  proveedores,
  proveedorId,
  setProveedorId,
  proveedorNombre,
  setProveedorNombre,
  proveedorRuc,
  setProveedorRuc,
  proveedorTelefono,
  setProveedorTelefono,
  proveedorDireccion,
  setProveedorDireccion,
  tipoComprobante,
  setTipoComprobante,
  numeroComprobante,
  setNumeroComprobante,
  fechaEmision,
  setFechaEmision,
  metodoPago,
  setMetodoPago,
}: ProveedorDocCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const matchedProveedor = proveedorId
    ? proveedores.find((p) => p.id === proveedorId) || null
    : null;

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProveedor = (prov: ProveedorAutocompleteItem) => {
    setProveedorId(prov.id);
    setProveedorNombre(prov.razonSocial);
    setProveedorRuc(prov.ruc || "");
    setProveedorTelefono(prov.telefono || "");
    setProveedorDireccion(prov.direccion || "");
    setShowSuggestions(false);
  };

  const clearSelectedProveedor = () => {
    setProveedorId(null);
    setProveedorNombre("");
    setProveedorRuc("");
    setProveedorTelefono("");
    setProveedorDireccion("");
  };

  const handleRucChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setProveedorRuc(clean);

    // Si estaba vinculado a un proveedor con otro RUC, desvincular
    if (matchedProveedor && matchedProveedor.ruc !== clean) {
      setProveedorId(null);
    }

    // Autocompletar si coincide exacto con un RUC guardado (8 u 11 dígitos)
    if (clean.length === 8 || clean.length === 11) {
      const exact = proveedores.find((p) => p.ruc === clean);
      if (exact) {
        selectProveedor(exact);
      }
    }
  };

  const handleNombreChange = (val: string) => {
    setProveedorNombre(val);
    if (matchedProveedor && matchedProveedor.razonSocial !== val) {
      setProveedorId(null);
    }
    setShowSuggestions(true);
  };

  // Filtrar sugerencias por RUC o Razón Social
  const suggestions = proveedores.filter((p) => {
    const qName = proveedorNombre.trim().toLowerCase();
    const qRuc = proveedorRuc.trim();
    if (!qName && !qRuc) return true;
    const matchName = qName
      ? p.razonSocial.toLowerCase().includes(qName) ||
        (p.nombreComercial || "").toLowerCase().includes(qName)
      : false;
    const matchRuc = qRuc ? (p.ruc || "").includes(qRuc) : false;
    return matchName || matchRuc;
  }).slice(0, 6);

  const isNewSupplier = !proveedorId && (proveedorNombre.trim().length > 2 || proveedorRuc.length >= 8);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-secondary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            1. Datos del Comprobante & Proveedor
          </h2>
        </div>

        {/* Badge de estado del proveedor */}
        {matchedProveedor ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-500">
            <CheckCircle2 className="size-3.5" />
            <span>Proveedor reconocido</span>
            <button
              type="button"
              onClick={clearSelectedProveedor}
              className="ml-1 hover:text-emerald-300 cursor-pointer"
              title="Limpiar selección"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : isNewSupplier ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-[11px] font-semibold text-secondary">
            <Sparkles className="size-3.5" />
            <span>Se registrará en el directorio</span>
          </div>
        ) : null}
      </div>

      {/* Contenedor con autocompletado de Proveedor */}
      <div ref={wrapperRef} className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RUC primero para flujo natural peruano */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>RUC / DNI Proveedor</span>
            {proveedores.length > 0 && !matchedProveedor && (
              <span className="text-[10px] font-normal text-muted-foreground">
                Autocompleta al ingresar RUC
              </span>
            )}
          </Label>
          <Input
            value={proveedorRuc}
            onChange={(e) => handleRucChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ej: 20512894102"
            maxLength={11}
            className="h-10 rounded-xl border-border bg-muted/20 text-xs font-mono font-semibold"
          />
        </div>

        {/* Proveedor / Razón Social */}
        <div className="space-y-1.5 relative">
          <Label className="text-xs font-bold text-foreground">
            Proveedor / Razón Social <span className="text-rose-500">*</span>
          </Label>
          <Input
            required
            value={proveedorNombre}
            onChange={(e) => handleNombreChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ej: Wurth Perú S.A.C., Sonax..."
            autoComplete="off"
            className="h-10 rounded-xl border-border bg-muted/20 text-xs font-medium"
          />

          {/* Dropdown de Sugerencias de Proveedores Guardados */}
          {showSuggestions && suggestions.length > 0 && !matchedProveedor && (
            <div className="absolute left-0 right-0 top-[68px] z-30 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-xl p-1.5 space-y-0.5 max-h-60 overflow-y-auto">
              <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Proveedores registrados ({suggestions.length})
              </p>
              {suggestions.map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => selectProveedor(prov)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {prov.razonSocial}
                    </p>
                    {prov.telefono && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        Tel: {prov.telefono}
                      </p>
                    )}
                  </div>
                  {prov.ruc && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary shrink-0">
                      {prov.ruc}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Bancaria o de Contacto rápida cuando el proveedor ya existe */}
      {matchedProveedor && (matchedProveedor.banco || matchedProveedor.cuentaBancaria || matchedProveedor.telefono) && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl bg-muted/20 border border-border/50 text-[11px] text-muted-foreground">
          {matchedProveedor.telefono && (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3 text-secondary" />
              <span>{matchedProveedor.telefono}</span>
            </span>
          )}
          {matchedProveedor.direccion && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-secondary" />
              <span className="truncate max-w-xs">{matchedProveedor.direccion}</span>
            </span>
          )}
          {(matchedProveedor.banco || matchedProveedor.cuentaBancaria) && (
            <span className="inline-flex items-center gap-1 font-mono text-foreground">
              <Landmark className="size-3 text-emerald-500" />
              <span>
                {matchedProveedor.banco ? `${matchedProveedor.banco}: ` : ""}
                {matchedProveedor.cuentaBancaria || matchedProveedor.cci}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Botón discreto para agregar Teléfono / Dirección si es proveedor nuevo */}
      {!matchedProveedor && (
        <div>
          <button
            type="button"
            onClick={() => setShowExtraFields(!showExtraFields)}
            className="text-[11px] font-semibold text-secondary hover:underline cursor-pointer"
          >
            {showExtraFields
              ? "- Ocultar datos opcionales del proveedor"
              : "+ Agregar teléfono o dirección del proveedor (opcional)"}
          </button>

          {showExtraFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2.5 border-t border-border/40">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3" /> Teléfono / WhatsApp
                </Label>
                <Input
                  value={proveedorTelefono}
                  onChange={(e) => setProveedorTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="h-9 rounded-xl border-border bg-muted/20 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> Dirección Fiscal / Almacén
                </Label>
                <Input
                  value={proveedorDireccion}
                  onChange={(e) => setProveedorDireccion(e.target.value)}
                  placeholder="Ej: Av. Nicolás Ayllón 1240, Ate"
                  className="h-9 rounded-xl border-border bg-muted/20 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Datos del Comprobante */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
        {/* Tipo Comprobante */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1">
            <Receipt className="size-3.5 text-muted-foreground" />
            Tipo de Documento <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={tipoComprobante}
            onValueChange={(val) => {
              if (val) setTipoComprobante(val);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl border-border bg-muted/20 text-xs font-medium">
              <SelectValue>
                {TIPO_DOC_LABELS[tipoComprobante] || tipoComprobante}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="factura">Factura Electrónica</SelectItem>
              <SelectItem value="boleta">Boleta de Venta</SelectItem>
              <SelectItem value="guia">Guía de Remisión</SelectItem>
              <SelectItem value="nota">Nota de Venta / Recibo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Número de Comprobante */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            N° de Serie y Correlativo <span className="text-rose-500">*</span>
          </Label>
          <Input
            required
            value={numeroComprobante}
            onChange={(e) => setNumeroComprobante(e.target.value.toUpperCase())}
            placeholder="Ej: F001-0004521"
            className="h-10 rounded-xl border-border bg-muted/20 text-xs font-mono font-bold uppercase"
          />
        </div>

        {/* Fecha de Emisión */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            Fecha de Emisión <span className="text-rose-500">*</span>
          </Label>
          <Input
            type="date"
            required
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            className="h-10 rounded-xl border-border bg-muted/20 text-xs font-medium"
          />
        </div>

        {/* Método de Pago */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1">
            <CreditCard className="size-3.5 text-muted-foreground" />
            Forma de Pago <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={metodoPago}
            onValueChange={(val) => {
              if (val) setMetodoPago(val);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl border-border bg-muted/20 text-xs font-medium">
              <SelectValue>
                {METODO_PAGO_LABELS[metodoPago] || metodoPago}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
              <SelectItem value="efectivo">Efectivo (Gaveta de Turno)</SelectItem>
              <SelectItem value="tarjeta">Tarjeta Débito / Crédito</SelectItem>
              <SelectItem value="credito">Crédito Comercial (30 Días)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
