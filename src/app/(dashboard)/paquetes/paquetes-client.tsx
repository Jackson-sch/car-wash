"use client";

import { useState, useMemo } from "react";
import { Package, PlusCircle, Search, X, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { togglePaqueteStatus, deletePaquete } from "@/lib/actions/paquetes";
import { toast } from "sonner";

import type { PaqueteItem, ServicioOption } from "./components/types";
import { PaquetesKpis } from "./components/PaquetesKpis";
import { PaquetesTable } from "./components/PaquetesTable";
import { PaquetesGrid } from "./components/PaquetesGrid";
import { PaqueteFormSheet } from "./components/PaqueteFormSheet";
import { DeletePaqueteDialog } from "./components/DeletePaqueteDialog";

interface PaquetesClientProps {
  initialPaquetes: PaqueteItem[];
  servicios: ServicioOption[];
}

export function PaquetesClient({ initialPaquetes, servicios }: PaquetesClientProps) {
  const [paquetes, setPaquetes] = useState<PaqueteItem[]>(initialPaquetes);
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [viewMode, setViewMode] = useQueryState("view", {
    defaultValue: "grid",
    shallow: true,
    history: "replace",
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(
    () =>
      paquetes.filter((p) =>
        p.nombre.toLowerCase().includes((search || "").toLowerCase())
      ),
    [paquetes, search]
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const editingPaquete = useMemo(
    () => paquetes.find((p) => p.id === editingId) || null,
    [paquetes, editingId]
  );

  const openCreate = () => {
    setEditingId(null);
    setIsSheetOpen(true);
  };

  const openEdit = (p: PaqueteItem) => {
    setEditingId(p.id);
    setIsSheetOpen(true);
  };

  const handleToggle = async (id: string) => {
    const res = await togglePaqueteStatus(id);
    if (res.success) {
      setPaquetes((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, activo: !p.activo } : p
        )
      );
      toast.success("Estado actualizado");
    } else {
      toast.error(res.error || "Error al cambiar estado");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deletePaquete(deleteId);
      if (res.success) {
        setPaquetes((prev) => prev.filter((p) => p.id !== deleteId));
        toast.success("Paquete desactivado");
        setDeleteId(null);
      } else {
        toast.error(res.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar el paquete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="h-7 w-7 text-secondary animate-pulse" />
            Paquetes de Servicios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Combina servicios en paquetes con precio especial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Vista */}
          <div className="bg-background backdrop-blur-md p-1 rounded-lg border border-border flex items-center shadow-xs">
            <button type="button" onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-350"
              }`}
            >
              <LayoutGrid className="size-4" />
              Cuadrícula
            </button>
            <button type="button" onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-350"
              }`}
            >
              <List className="size-4" />
              Tabla
            </button>
          </div>

          <Button
            onClick={openCreate}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Nuevo Paquete
          </Button>
        </div>
      </div>

      {/* KPI Stats Bento Grid */}
      <PaquetesKpis paquetes={paquetes} />

      {/* Search and Filters Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paquete..."
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(null);
          }}
          className="pl-9 pr-9 bg-card/60 backdrop-blur-md border-border hover:border-zinc-400 focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9 rounded-lg text-foreground placeholder:text-muted-foreground transition-colors shadow-sm"
        />
        {search && (
          <button type="button" onClick={() => {
              setSearch("");
              setPage(null);
            }}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main View List/Grid */}
      <div className="transition-opacity duration-300">
        {viewMode === "grid" ? (
          <PaquetesGrid
            data={paginatedData}
            searchQuery={search}
            onEdit={openEdit}
            onToggleStatus={handleToggle}
            onDelete={setDeleteId}
          />
        ) : (
          <PaquetesTable
            data={paginatedData}
            searchQuery={search}
            onEdit={openEdit}
            onToggleStatus={handleToggle}
            onDelete={setDeleteId}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          activePage={activePage}
          totalPages={totalPages}
          onPageChange={setPage}
          showInfo
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Create/Edit Form Sheet */}
      <PaqueteFormSheet
        key={`paquete-${editingId ?? "new"}-${isSheetOpen ? "open" : "closed"}`}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        editingId={editingId}
        initialData={editingPaquete}
        servicios={servicios}
        onSuccess={setPaquetes}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePaqueteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
