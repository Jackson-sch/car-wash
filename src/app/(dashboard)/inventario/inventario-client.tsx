"use client";

import { useState, useTransition } from "react";
import { Package, Plus, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Productos */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-secondary/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total de Productos
              </span>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalItems} <span className="text-sm font-medium text-muted-foreground">ítems</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monitoreando catálogo de materiales</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 2: Bajo Stock */}
        <div className={`relative group overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md ${
          lowStockItems > 0 
            ? "border-amber-500/30 hover:border-amber-500/60" 
            : "border-border hover:border-zinc-350"
        }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Bajo Stock Mínimo
              </span>
              <h3 className={`text-3xl font-extrabold tracking-tight ${
                lowStockItems > 0 ? "text-amber-500" : "text-foreground"
              }`}>
                {lowStockItems} <span className="text-sm font-medium text-muted-foreground">alertas</span>
              </h3>
            </div>
            <div className={`p-3.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${
              lowStockItems > 0 ? "bg-amber-500/10 text-amber-500" : "bg-zinc-500/10 text-zinc-500"
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {totalItems > 0 ? (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-colors duration-500 ${
                    lowStockItems > 0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${(lowStockItems / totalItems) * 100}%` }}
                />
              </div>
            ) : (
              <div className="h-1.5" />
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {lowStockItems > 0 
                ? "Requiere reabastecimiento pronto" 
                : "Niveles de stock estables"}
            </p>
          </div>
          {lowStockItems > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-amber-500/50 to-transparent" />
          )}
        </div>

        {/* Card 3: Agotados */}
        <div className={`relative group overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md ${
          outOfStockItems > 0 
            ? "border-rose-500/30 hover:border-rose-500/60" 
            : "border-border hover:border-zinc-350"
        }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Insumos Agotados
              </span>
              <h3 className={`text-3xl font-extrabold tracking-tight ${
                outOfStockItems > 0 ? "text-rose-500" : "text-foreground"
              }`}>
                {outOfStockItems} <span className="text-sm font-medium text-muted-foreground">ítems</span>
              </h3>
            </div>
            <div className={`p-3.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${
              outOfStockItems > 0 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-zinc-500/10 text-zinc-500"
            }`}>
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${
              outOfStockItems > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"
            }`} />
            <span>
              {outOfStockItems > 0 
                ? "¡Crítico! Reponer stock inmediatamente" 
                : "Sin rupturas de stock"}
            </span>
          </div>
          {outOfStockItems > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-rose-500/50 to-transparent" />
          )}
        </div>
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
