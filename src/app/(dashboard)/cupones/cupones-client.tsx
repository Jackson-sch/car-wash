"use client";

import { useState, useMemo } from "react";
import { Tag, Gift, TrendingUp, Lightbulb } from "lucide-react";
import { CuponForm } from "./components/CuponForm";
import { CuponesSidebar } from "./components/CuponesSidebar";

interface ServicioType {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoriaNombre: string | null;
}

interface CuponBasic {
  id: string;
  codigo: string;
  activo: boolean;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  fechaFin: Date | null;
  usos?: unknown[];
  servicios?: { servicioId?: string | null; servicio?: { id: string } | null }[];
}

export function CuponesClient({
  initialCupones,
  servicios,
}: {
  initialCupones: CuponBasic[];
  servicios: ServicioType[];
}) {
  const [editingCupon, setEditingCupon] = useState<CuponBasic | null>(null);

  const totalCupones = initialCupones.length;
  const activos = initialCupones.filter((c: CuponBasic) => c.activo).length;
  const totalUsos = useMemo(
    () => initialCupones.reduce((acc: number, c: CuponBasic) => acc + (c.usos?.length || 0), 0),
    [initialCupones]
  );

  const handleEdit = (cupon: CuponBasic) => {
    setEditingCupon(cupon);
  };

  const handleCancelEdit = () => {
    setEditingCupon(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Tag className="h-7 w-7 text-secondary" />
            Generador de Cupones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea y administra descuentos promocionales para tus clientes.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total de Cupones */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-secondary/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total de Cupones
              </span>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalCupones} <span className="text-sm font-medium text-muted-foreground">códigos</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Catálogo promocional del negocio</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 2: Cupones Activos */}
        <div className={`relative group overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md ${
          activos > 0 
            ? "border-emerald-500/30 hover:border-emerald-500/60" 
            : "border-border hover:border-zinc-350"
        }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Cupones Activos
              </span>
              <h3 className={`text-3xl font-extrabold tracking-tight ${
                activos > 0 ? "text-emerald-500" : "text-foreground"
              }`}>
                {activos} <span className="text-sm font-medium text-muted-foreground">activos</span>
              </h3>
            </div>
            <div className={`p-3.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${
              activos > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
            }`}>
              <Gift className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {totalCupones > 0 ? (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-colors duration-500"
                  style={{ width: `${(activos / totalCupones) * 100}%` }}
                />
              </div>
            ) : (
              <div className="h-1.5" />
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {activos > 0 
                ? "Campañas promocionales en curso" 
                : "Sin promociones activas"}
            </p>
          </div>
          {activos > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-emerald-500/50 to-transparent" />
          )}
        </div>

        {/* Card 3: Canjes Totales */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-blue-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Canjes Registrados
              </span>
              <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
                {totalUsos} <span className="text-sm font-medium text-muted-foreground">usos</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Descuentos aplicados a órdenes de lavado</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Explicación de los cupones */}
      <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary text-xs space-y-2 leading-relaxed">
        <p className="font-bold text-secondary flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-secondary shrink-0" />
          Guía de Cupones y Promociones
        </p>
        <p className="text-muted-foreground">
          Usa esta sección para configurar códigos de descuento promocionales para las órdenes de tus clientes:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground/80 space-y-1">
          <li><strong>Tipos de Descuento:</strong> Puedes elegir entre un porcentaje (ej. 10% de ahorro) o un monto fijo de descuento (ej. S/ 5.00 de descuento).</li>
          <li><strong>Condición de Mínimo de Compra:</strong> Establece un umbral mínimo en dinero para habilitar la validez del cupón.</li>
          <li><strong>Restricciones de Uso:</strong> Define el límite total de canjes por cupón para proteger el margen de ganancia de tu negocio.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="xl:col-span-2 space-y-6">
          <CuponForm
            servicios={servicios}
            editingCupon={editingCupon}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Right Column: Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <CuponesSidebar cupones={initialCupones} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
}
