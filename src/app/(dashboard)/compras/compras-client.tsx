"use client";

import { useState, useMemo } from "react";
import { ComprasHeader } from "./components/ComprasHeader";
import { ComprasKpis } from "./components/ComprasKpis";
import { ComprasToolbar } from "./components/ComprasToolbar";
import { ComprasTable } from "./components/ComprasTable";
import type { CompraItem, CompraFilterType } from "./types";

interface ComprasClientProps {
  initialCompras: CompraItem[];
}

export function ComprasClient({ initialCompras }: ComprasClientProps) {
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CompraFilterType>("todos");

  // Conteos
  const counts = useMemo(() => {
    return {
      todos: initialCompras.length,
      factura: initialCompras.filter((c) => c.tipoComprobante === "factura").length,
      boleta: initialCompras.filter((c) => c.tipoComprobante === "boleta").length,
      completada: initialCompras.filter((c) => c.estado === "completada").length,
      anulada: initialCompras.filter((c) => c.estado === "anulada").length,
    };
  }, [initialCompras]);

  // Filtrado reactivo
  const filteredCompras = useMemo(() => {
    return initialCompras.filter((compra) => {
      // 1. Filtro por tipo/estado
      if (filterType === "factura" && compra.tipoComprobante !== "factura") return false;
      if (filterType === "boleta" && compra.tipoComprobante !== "boleta") return false;
      if (filterType === "completada" && compra.estado !== "completada") return false;
      if (filterType === "anulada" && compra.estado !== "anulada") return false;

      // 2. Búsqueda por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNum = compra.numeroComprobante.toLowerCase().includes(query);
        const matchProv = compra.proveedorNombre.toLowerCase().includes(query);
        const matchRuc = (compra.proveedorRuc || "").toLowerCase().includes(query);
        const matchItem = compra.detalles.some((d) =>
          d.descripcion.toLowerCase().includes(query)
        );

        if (!matchNum && !matchProv && !matchRuc && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [initialCompras, filterType, searchTerm]);

  return (
    <div className="space-y-4">
      {/* 1. Header con link a /compras/nueva y exportación Excel */}
      <ComprasHeader />

      {/* 2. Dock de KPIs compactos unificados */}
      <ComprasKpis compras={initialCompras} />

      {/* 3. Toolbar con búsqueda y filtros pills */}
      <ComprasToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        counts={counts}
      />

      {/* 4. Tabla de facturas y boletas con navegación directa a /compras/[id] */}
      <ComprasTable compras={filteredCompras} />
    </div>
  );
}
