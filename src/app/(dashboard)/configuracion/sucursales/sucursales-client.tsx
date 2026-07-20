"use client";
 
import { useState, useMemo } from "react";
import { ArrowLeft, Building2, PlusCircle, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { toggleSucursalStatusAction, setMainSucursalAction } from "@/lib/actions/sucursales";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { SucursalItem } from "./components/types";
import { SucursalesKpis } from "./components/SucursalesKpis";
import { SucursalesGrid } from "./components/SucursalesGrid";
import { SucursalFormSheet } from "./components/SucursalFormSheet";

interface SucursalesClientProps {
  initialSucursales: SucursalItem[];
  limiteSucursales: number | null;
  initialUserSucursalId: string | null;
}

export function SucursalesClient({
  initialSucursales,
  limiteSucursales,
  initialUserSucursalId,
}: SucursalesClientProps) {
  const router = useRouter();
  const [sucursales, setSucursales] = useState<SucursalItem[]>(initialSucursales);
  const [userSucursalId, setUserSucursalId] = useState<string | null>(initialUserSucursalId);
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      sucursales.filter((s) =>
        s.nombre.toLowerCase().includes((search || "").toLowerCase())
      ),
    [sucursales, search]
  );

  const editingSucursal = useMemo(
    () => sucursales.find((s) => s.id === editingId) || null,
    [sucursales, editingId]
  );

  const openCreate = () => {
    if (limiteSucursales !== null && sucursales.length >= limiteSucursales) {
      toast.error(
        `Límite alcanzado: Tu plan solo permite un máximo de ${limiteSucursales} sucursal(es).`
      );
      return;
    }
    setEditingId(null);
    setIsSheetOpen(true);
  };

  const openEdit = (s: SucursalItem) => {
    setEditingId(s.id);
    setIsSheetOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    const res = await toggleSucursalStatusAction(id);
    if (res.success && res.sucursal) {
      const updated = res.sucursal as SucursalItem;
      setSucursales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, activa: updated.activa } : s))
      );
      toast.success(updated.activa ? "Sucursal activada" : "Sucursal desactivada");
    } else {
      toast.error(res.error || "Error al cambiar estado");
    }
  };

  const handleSetMain = async (id: string) => {
    const res = await setMainSucursalAction(id);
    if (res.success) {
      setSucursales((prev) =>
        prev.map((s) => {
          const currentConfig = (s.config || {}) as Record<string, unknown>;
          return {
            ...s,
            config: { ...currentConfig, esPrincipal: s.id === id },
          };
        })
      );
      toast.success("Sucursal principal establecida");
    } else {
      toast.error(res.error || "Error al establecer sucursal principal");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-secondary animate-pulse" />
            Sucursales de la Empresa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tus locales de servicio, datos comerciales y sucursales de trabajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/configuracion")}
            className="h-10 rounded-lg border-border hover:border-zinc-350 hover:bg-muted/50 gap-1.5 cursor-pointer shadow-xs font-bold text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Configuración
          </Button>

          <Button
            onClick={openCreate}
            disabled={limiteSucursales !== null && sucursales.length >= limiteSucursales}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Nueva Sucursal
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <SucursalesKpis
        sucursales={sucursales}
        limiteSucursales={limiteSucursales}
        userSucursalId={userSucursalId}
      />

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar sucursal por nombre..."
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 bg-card/60 backdrop-blur-md border-border hover:border-zinc-400 focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9 rounded-lg text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Card Grid */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <SucursalesGrid
          data={filtered}
          searchQuery={search}
          userSucursalId={userSucursalId}
          onEdit={openEdit}
          onToggleStatus={handleToggleStatus}
          onSwitchSuccess={setUserSucursalId}
          onSetMain={handleSetMain}
        />
      </div>

      {/* Form Sheet */}
      <SucursalFormSheet
        key={`sucursal-${editingId ?? "new"}-${isSheetOpen ? "open" : "closed"}`}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        editingId={editingId}
        initialData={editingSucursal}
        onSuccess={setSucursales}
      />
    </div>
  );
}
