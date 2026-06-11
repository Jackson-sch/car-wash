"use client";

import { useState, useTransition } from "react";
import { Package, Plus, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
import { registrarItemInventario, registrarMovimientoStock } from "@/lib/actions/inventario";
import { toast } from "sonner";
import { InventarioTable } from "./components/InventarioTable";
import { CrearInsumoModal } from "./components/CrearInsumoModal";
import { AjustarStockModal } from "./components/AjustarStockModal";

interface Insumo {
  id: string;
  nombre: string;
  descripcion: string | null;
  unidad: string | null;
  stock: string | null;
  stockMinimo: string | null;
  precioCompra: string | null;
  proveedor: string | null;
  activo: boolean | null;
}

interface InventarioClientProps {
  initialInventario: Insumo[];
}

export function InventarioClient({ initialInventario }: InventarioClientProps) {
  const [inventarioList, setInventarioList] = useState<Insumo[]>(initialInventario);
  const [isPending, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Insumo | null>(null);

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

  const totalItems = inventarioList.length;

  const lowStockItems = inventarioList.filter((item) => {
    const st = parseFloat(item.stock || "0");
    const min = parseFloat(item.stockMinimo || "0");
    return st <= min && st > 0;
  }).length;

  const outOfStockItems = inventarioList.filter((item) => {
    const st = parseFloat(item.stock || "0");
    return st === 0;
  }).length;

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="h-7 w-7 text-secondary" />
            Control de Inventario
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisa stock mínimo de químicos, ceras y siliconas, y registra reposiciones de materiales.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Agregar Insumo
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Productos"
          value={totalItems}
          icon={<Package className="h-5 w-5" />}
          iconBg="bg-secondary/10"
        />
        <StatsCard
          label="Bajo Stock Mínimo"
          value={`${lowStockItems} ítems`}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          valueColor="text-amber-600"
        />
        <StatsCard
          label="Insumos Agotados"
          value={`${outOfStockItems} ítems`}
          icon={<TrendingDown className="h-5 w-5" />}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600"
        />
      </div>

      {/* Inventory Table */}
      <InventarioTable insumos={inventarioList} onAdjustStock={handleOpenAjuste} />

      {/* Modals */}
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
    </div>
  );
}
