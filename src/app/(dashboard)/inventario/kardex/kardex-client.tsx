"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { KardexHeader } from "./components/KardexHeader";
import { KardexKpis } from "./components/KardexKpis";
import { KardexToolbar, type KardexTipoFilter } from "./components/KardexToolbar";
import { KardexTable } from "./components/KardexTable";
import type { KardexMovimiento, InsumoSimple } from "./types";

interface KardexClientProps {
  initialMovimientos: KardexMovimiento[];
  insumos: InsumoSimple[];
}

export function KardexClient({ initialMovimientos, insumos }: KardexClientProps) {
  // Query param para insumo prefiltrado (ej. /inventario/kardex?insumoId=...)
  const [insumoParam, setInsumoParam] = useQueryState(
    "insumoId",
    parseAsString.withDefault("todos").withOptions({ shallow: true })
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<KardexTipoFilter>("todos");

  // Filtrado compuesto
  const filteredMovimientos = useMemo(() => {
    return initialMovimientos.filter((m) => {
      // 1. Filtro por insumo
      if (insumoParam && insumoParam !== "todos" && m.insumoId !== insumoParam) {
        return false;
      }

      // 2. Filtro por tipo
      if (tipoFilter !== "todos" && m.tipo !== tipoFilter) {
        return false;
      }

      // 3. Filtro por búsqueda de texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchMotivo = (m.motivo || "").toLowerCase().includes(q);
        const matchInsumo = m.insumoNombre.toLowerCase().includes(q);
        const matchUser = m.usuarioResponsable.toLowerCase().includes(q);
        if (!matchMotivo && !matchInsumo && !matchUser) return false;
      }

      return true;
    });
  }, [initialMovimientos, insumoParam, tipoFilter, searchQuery]);

  // Conteos dinámicos para las píldoras de tipo
  const counts = useMemo(() => {
    // Si hay un insumo prefiltrado, los conteos se calculan respecto a ese insumo
    const baseList =
      insumoParam && insumoParam !== "todos"
        ? initialMovimientos.filter((m) => m.insumoId === insumoParam)
        : initialMovimientos;

    let entrada = 0;
    let salida = 0;
    let ajuste = 0;

    baseList.forEach((m) => {
      if (m.tipo === "entrada") entrada++;
      else if (m.tipo === "salida") salida++;
      else if (m.tipo === "ajuste") ajuste++;
    });

    return {
      total: baseList.length,
      entrada,
      salida,
      ajuste,
    };
  }, [initialMovimientos, insumoParam]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    tipoFilter !== "todos" ||
    (Boolean(insumoParam) && insumoParam !== "todos");

  const handleClearFilters = () => {
    setSearchQuery("");
    setTipoFilter("todos");
    setInsumoParam("todos");
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-foreground pb-12">
      {/* 1. Header con botón a Inventario y Exportar Excel */}
      <KardexHeader
        filtros={{
          insumoId: insumoParam || undefined,
          tipo: tipoFilter,
        }}
        totalMovimientos={filteredMovimientos.length}
      />

      {/* 2. Dock de Métricas de Kardex */}
      <KardexKpis movimientos={filteredMovimientos} />

      {/* 3. Toolbar de Filtros y Buscador */}
      <KardexToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tipoFilter={tipoFilter}
        onTipoFilterChange={setTipoFilter}
        insumoFilter={insumoParam || "todos"}
        onInsumoFilterChange={setInsumoParam}
        insumos={insumos}
        counts={counts}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Tabla Maestra de Kardex */}
      <KardexTable
        movimientos={filteredMovimientos}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
