"use client";

import { useState, useTransition, useMemo } from "react";
import {
  registrarItemInventario,
  registrarMovimientoStock,
  actualizarItemInventarioAction,
  cambiarEstadoInsumoAction,
} from "@/lib/actions/inventario";
import { toast } from "sonner";
import { InventarioHeader } from "./components/InventarioHeader";
import { InventarioKpis } from "./components/InventarioKpis";
import { InventarioToolbar, type StatusFilter } from "./components/InventarioToolbar";
import { InventarioTable, type Insumo } from "./components/InventarioTable";
import { CrearInsumoModal } from "./components/CrearInsumoModal";
import { AjustarStockModal } from "./components/AjustarStockModal";
import { KardexMovimientosModal } from "./components/KardexMovimientosModal";
import { EditarInsumoModal } from "./components/EditarInsumoModal";
import { RecetasServiciosModal } from "./components/RecetasServiciosModal";

interface InventarioClientProps {
  initialInventario: Insumo[];
}

export function InventarioClient({ initialInventario }: InventarioClientProps) {
  const [inventarioList, setInventarioList] = useState<Insumo[]>(initialInventario);
  const [isPending, startTransition] = useTransition();

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [unitFilter, setUnitFilter] = useState<string>("todas");

  // Estados de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRecetasOpen, setIsRecetasOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Insumo | null>(null);

  // Unidades disponibles únicas para el filtro
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    inventarioList.forEach((i) => {
      if (i.unidad) set.add(i.unidad);
    });
    return Array.from(set).sort();
  }, [inventarioList]);

  // Conteos para las píldoras de estado
  const counts = useMemo(() => {
    let suficiente = 0;
    let bajo = 0;
    let agotado = 0;

    inventarioList.forEach((item) => {
      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");
      if (st === 0) {
        agotado++;
      } else if (st <= min) {
        bajo++;
      } else {
        suficiente++;
      }
    });

    return {
      total: inventarioList.length,
      suficiente,
      bajo,
      agotado,
    };
  }, [inventarioList]);

  // Filtrado compuesto
  const filteredInsumos = useMemo(() => {
    return inventarioList.filter((item) => {
      // 1. Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.nombre.toLowerCase().includes(q);
        const matchDesc = (item.descripcion || "").toLowerCase().includes(q);
        const matchProv = (item.proveedor || "").toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchProv) return false;
      }

      // 2. Filtro por Unidad
      if (unitFilter !== "todas" && item.unidad !== unitFilter) {
        return false;
      }

      // 3. Filtro por Estado
      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");

      if (statusFilter === "suficiente") return st > min;
      if (statusFilter === "bajo") return st <= min && st > 0;
      if (statusFilter === "agotado") return st === 0;

      return true;
    });
  }, [inventarioList, searchQuery, unitFilter, statusFilter]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || statusFilter !== "todos" || unitFilter !== "todas";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("todos");
    setUnitFilter("todas");
  };

  const handleSaveItem = async (data: {
    nombre: string;
    descripcion: string;
    unidad: string;
    stockMinimo: string;
    precioCompra: string;
    proveedor: string;
  }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await registrarItemInventario({
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidad: data.unidad,
          stockMinimo: parseFloat(data.stockMinimo).toFixed(3),
          precioCompra: data.precioCompra || undefined,
          proveedor: data.proveedor,
        });

        if (res.success && res.data) {
          toast.success("Insumo registrado con éxito");
          setInventarioList((prev) => [...prev, res.data as Insumo]);
          resolve(true);
        } else {
          toast.error(res.error || "Ocurrió un error");
          resolve(false);
        }
      });
    });
  };

  const handleOpenAjuste = (item: Insumo) => {
    setSelectedItem(item);
    setIsAjusteOpen(true);
  };

  const handleOpenKardex = (item: Insumo) => {
    setSelectedItem(item);
    setIsKardexOpen(true);
  };

  const handleOpenEdit = (item: Insumo) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (data: {
    id: string;
    nombre: string;
    descripcion: string;
    unidad: string;
    stockMinimo: string;
    precioCompra: string;
    proveedor: string;
  }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await actualizarItemInventarioAction({
          id: data.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidad: data.unidad,
          stockMinimo: data.stockMinimo,
          precioCompra: data.precioCompra || undefined,
          proveedor: data.proveedor,
        });

        if (res.success && res.data) {
          toast.success("Insumo actualizado exitosamente");
          setInventarioList((prev) =>
            prev.map((i) => (i.id === data.id ? (res.data as Insumo) : i))
          );
          resolve(true);
        } else {
          toast.error(res.error || "No se pudo actualizar el insumo");
          resolve(false);
        }
      });
    });
  };

  const handleToggleActivo = async (id: string, activo: boolean): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await cambiarEstadoInsumoAction(id, activo);
        if (res.success) {
          toast.success("Insumo dado de baja del catálogo");
          setInventarioList((prev) => prev.filter((i) => i.id !== id));
          resolve(true);
        } else {
          toast.error(res.error || "No se pudo desactivar el insumo");
          resolve(false);
        }
      });
    });
  };

  const handleSaveAjuste = async (
    tipo: "entrada" | "salida" | "ajuste",
    cantidad: string,
    motivo: string
  ): Promise<boolean> => {
    if (!selectedItem) return false;

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await registrarMovimientoStock({
          itemId: selectedItem.id,
          tipo,
          cantidad: parseFloat(cantidad).toFixed(3),
          motivo,
        });

        if (res.success && res.data) {
          toast.success("Movimiento de stock registrado");
          setInventarioList((prev) =>
            prev.map((item) => (item.id === selectedItem.id ? (res.data as Insumo) : item))
          );
          resolve(true);
        } else {
          toast.error(res.error || "Error al registrar movimiento");
          resolve(false);
        }
      });
    });
  };

  const handleQuickAdjust = (item: Insumo, tipo: "entrada" | "salida", delta: number) => {
    startTransition(async () => {
      const res = await registrarMovimientoStock({
        itemId: item.id,
        tipo,
        cantidad: delta.toFixed(3),
        motivo: tipo === "entrada" ? "Ingreso rápido (+1)" : "Despacho rápido (-1)",
      });

      if (res.success && res.data) {
        toast.success(
          tipo === "entrada"
            ? `+${delta} ${item.unidad || "uds"} agregado a ${item.nombre}`
            : `-${delta} ${item.unidad || "uds"} descontado de ${item.nombre}`
        );
        setInventarioList((prev) =>
          prev.map((i) => (i.id === item.id ? (res.data as Insumo) : i))
        );
      } else {
        toast.error(res.error || "No se pudo actualizar el stock");
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-foreground pb-12">
      {/* 1. Header con Exportación a Excel, Recetas y Crear Insumo */}
      <InventarioHeader
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenRecetas={() => setIsRecetasOpen(true)}
        totalItems={inventarioList.length}
      />

      {/* 2. Bento KPI Grid (Total, Capital Valorizado en S/, Bajo Mínimo, Agotados) */}
      <InventarioKpis insumos={inventarioList} />

      {/* 3. Toolbar con Píldoras de Estado y Buscador */}
      <InventarioToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        unitFilter={unitFilter}
        onUnitFilterChange={setUnitFilter}
        availableUnits={availableUnits}
        counts={counts}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Tabla de Inventario con Kardex, Ajuste, Edición y Micro-ajustes */}
      <InventarioTable
        insumos={filteredInsumos}
        onAdjustStock={handleOpenAjuste}
        onViewKardex={handleOpenKardex}
        onEditInsumo={handleOpenEdit}
        onQuickAdjust={handleQuickAdjust}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Modales */}
      <CrearInsumoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isPending={isPending}
        onSave={handleSaveItem}
      />

      <AjustarStockModal
        isOpen={isAjusteOpen}
        onClose={() => setIsAjusteOpen(false)}
        selectedItem={selectedItem}
        isPending={isPending}
        onSave={handleSaveAjuste}
      />

      <KardexMovimientosModal
        isOpen={isKardexOpen}
        onClose={() => setIsKardexOpen(false)}
        insumo={selectedItem}
      />

      <EditarInsumoModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        insumo={selectedItem}
        isPending={isPending}
        onSave={handleSaveEdit}
        onToggleActivo={handleToggleActivo}
      />

      <RecetasServiciosModal
        isOpen={isRecetasOpen}
        onClose={() => setIsRecetasOpen(false)}
        insumos={inventarioList}
      />
    </div>
  );
}
