"use client";

import { useState, useMemo, useTransition } from "react";
import { Tag, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleCupon, deleteCupon, getCupones } from "@/lib/actions/cupones";
import type { CuponItem, ServicioOption, CuponFilterType } from "./types";
import { CuponesHeader } from "./components/CuponesHeader";
import { CuponesKpis } from "./components/CuponesKpis";
import { CuponesGuide } from "./components/CuponesGuide";
import { CuponesToolbar } from "./components/CuponesToolbar";
import { CuponVoucherCard } from "./components/CuponVoucherCard";
import { CuponesTable } from "./components/CuponesTable";
import { CuponForm } from "./components/CuponForm";

interface CuponesClientProps {
  initialCupones: CuponItem[];
  servicios: ServicioOption[];
}

export function CuponesClient({ initialCupones, servicios }: CuponesClientProps) {
  const [cupones, setCupones] = useState<CuponItem[]>(initialCupones);
  const [editingCupon, setEditingCupon] = useState<CuponItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<CuponFilterType>("todos");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isPending, startTransition] = useTransition();

  const now = useMemo(() => new Date(), []);

  // Conteo de filtros
  const counts = useMemo(() => {
    let activos = 0;
    let porcentaje = 0;
    let fijo = 0;
    let agotados_expirados = 0;

    cupones.forEach((c) => {
      const isExpired = c.fechaFin ? new Date(c.fechaFin) < now : false;
      const isExhausted = (c.limiteTotal ?? 0) > 0 && (c.usos?.length || 0) >= (c.limiteTotal ?? 0);

      if (c.activo && !isExpired && !isExhausted) activos++;
      if (c.tipoDescuento === "porcentaje") porcentaje++;
      if (c.tipoDescuento === "fijo") fijo++;
      if (!c.activo || isExpired || isExhausted) agotados_expirados++;
    });

    return {
      todos: cupones.length,
      activos,
      porcentaje,
      fijo,
      agotados_expirados,
    };
  }, [cupones, now]);

  // Cupones filtrados
  const filteredCupones = useMemo(() => {
    return cupones.filter((c) => {
      // Búsqueda universal por código
      const term = searchQuery.toLowerCase().trim();
      if (term && !c.codigo.toLowerCase().includes(term)) {
        return false;
      }

      const isExpired = c.fechaFin ? new Date(c.fechaFin) < now : false;
      const isExhausted = (c.limiteTotal ?? 0) > 0 && (c.usos?.length || 0) >= (c.limiteTotal ?? 0);

      if (filterType === "activos") {
        return c.activo && !isExpired && !isExhausted;
      }
      if (filterType === "porcentaje") {
        return c.tipoDescuento === "porcentaje";
      }
      if (filterType === "fijo") {
        return c.tipoDescuento === "fijo";
      }
      if (filterType === "agotados_expirados") {
        return !c.activo || isExpired || isExhausted;
      }

      return true;
    });
  }, [cupones, searchQuery, filterType, now]);

  const handleEdit = (cupon: CuponItem) => {
    setEditingCupon(cupon);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCupon(null);
    setIsCreating(false);
  };

  const refreshCuponesList = async () => {
    const rawCupones = await getCupones();
    setCupones(
      rawCupones.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        activo: c.activo === true,
        tipoDescuento: c.tipoDescuento,
        valorDescuento:
          typeof c.valorDescuento === "string"
            ? parseFloat(c.valorDescuento)
            : c.valorDescuento,
        compraMinima: c.compraMinima ? parseFloat(c.compraMinima) : null,
        limiteTotal: c.limiteTotal ?? null,
        limitePorCliente: c.limitePorCliente ?? 1,
        fechaInicio: c.fechaInicio ? new Date(c.fechaInicio) : null,
        fechaFin: c.fechaFin ? new Date(c.fechaFin) : null,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        usos: c.usos,
        servicios: c.servicios,
      }))
    );
  };

  const handleDelete = (id: string, codigo: string) => {
    if (!window.confirm(`¿Eliminar el cupón ${codigo}?`)) return;
    startTransition(async () => {
      const res = await deleteCupon(id);
      if (res.success) {
        setCupones((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Cupón ${codigo} eliminado`);
      } else {
        toast.error(res.error || "No se pudo eliminar el cupón");
      }
    });
  };

  const handleToggleStatus = (id: string, activoActual: boolean) => {
    startTransition(async () => {
      // Actualización optimista
      setCupones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activo: !activoActual } : c))
      );

      const res = await toggleCupon(id, !activoActual);
      if (res.success) {
        toast.success(activoActual ? "Cupón pausado" : "Cupón activado");
      } else {
        // Revertir optimismo en caso de error
        setCupones((prev) =>
          prev.map((c) => (c.id === id ? { ...c, activo: activoActual } : c))
        );
        toast.error(res.error || "No se pudo actualizar el estado del cupón.");
      }
    });
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || filterType !== "todos");

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("todos");
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground pb-12">
      {/* 1. Header con Exportación Excel & Nuevo Cupón */}
      <CuponesHeader
        isCreating={isCreating}
        onToggleCreating={() => {
          if (isCreating) {
            handleCancelEdit();
          } else {
            setEditingCupon(null);
            setIsCreating(true);
          }
        }}
        showGuide={showGuide}
        onToggleGuide={() => setShowGuide(!showGuide)}
      />

      {/* 2. Guía Desplegable */}
      {showGuide && <CuponesGuide />}

      {/* 3. Bento KPI Cards */}
      <CuponesKpis cupones={cupones} />

      {/* 4. Formulario de Creación / Edición Desplegable */}
      {isCreating && (
        <Card className="p-5 sm:p-6 border-secondary/30 bg-card rounded-3xl shadow-xl space-y-4 animate-in fade-in-0 zoom-in-98">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                <Tag className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {editingCupon ? `Editar Cupón: ${editingCupon.codigo}` : "Crear Nuevo Código Promocional"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define el valor del descuento, servicios aplicables y condiciones de validez.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelEdit}
              className="size-8 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          <CuponForm
            servicios={servicios}
            editingCupon={editingCupon}
            onCancelEdit={handleCancelEdit}
            onSuccess={refreshCuponesList}
          />
        </Card>
      )}

      {/* 5. Toolbar de Búsqueda, Filtros y Modo de Vista */}
      <CuponesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 6. Contenido Principal: Vouchers o Tabla */}
      {filteredCupones.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Tag className="size-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {hasActiveFilters ? "Sin resultados para los filtros aplicados" : "No hay cupones registrados"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {hasActiveFilters
              ? "Prueba buscando con otro código o limpiando los filtros activos."
              : "Genera tu primer código promocional para atraer y premiar a tus clientes."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs font-bold h-9 rounded-xl border-border cursor-pointer"
            >
              Restablecer Filtros
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setEditingCupon(null);
                setIsCreating(true);
              }}
              className="mt-2 text-xs font-bold h-9 rounded-xl bg-secondary text-secondary-foreground cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5 mr-1" />
              Crear Primer Cupón
            </Button>
          )}
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCupones.map((c) => (
            <CuponVoucherCard
              key={c.id}
              cupon={c}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <CuponesTable
          cupones={filteredCupones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isPending={isPending}
        />
      )}
    </div>
  );
}
