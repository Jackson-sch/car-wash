"use client";

import { useState, useMemo } from "react";
import {
  Package,
  PlusCircle,
  Search,
  X,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Check,
  Layers,
  Gift,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryState, parseAsInteger } from "nuqs";
import { StatsCard } from "@/components/shared/StatsCard";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPaquete, updatePaquete, togglePaqueteStatus, deletePaquete } from "@/lib/actions/paquetes";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formats";

interface PaqueteItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  activo: boolean | null;
  createdAt: Date | null;
  servicios: { id: string; nombre: string }[];
}

interface ServicioOption {
  id: string;
  nombre: string;
  precio: string;
}

interface PaquetesClientProps {
  initialPaquetes: PaqueteItem[];
  servicios: ServicioOption[];
}

type PaqueteFormData = {
  nombre: string;
  descripcion: string;
  precio: string;
  servicioIds: string[];
};

const emptyForm: PaqueteFormData = {
  nombre: "",
  descripcion: "",
  precio: "",
  servicioIds: [],
};

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaqueteFormData>(emptyForm);

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

  const totalPaquetes = paquetes.length;
  const activos = paquetes.filter((p) => p.activo).length;
  const valorTotal = paquetes.reduce((acc, p) => acc + parseFloat(p.precio), 0);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsSheetOpen(true);
  };

  const openEdit = (p: PaqueteItem) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio,
      servicioIds: p.servicios.map((s) => s.id),
    });
    setIsSheetOpen(true);
  };

  const toggleServicio = (id: string) => {
    setForm((prev) => ({
      ...prev,
      servicioIds: prev.servicioIds.includes(id)
        ? prev.servicioIds.filter((sId) => sId !== id)
        : [...prev.servicioIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precio.trim()) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setSaving(true);
    const res = editingId
      ? await updatePaquete(editingId, form)
      : await createPaquete(form);

    if (res.success) {
      toast.success(editingId ? "Paquete actualizado" : "Paquete creado");
      setIsSheetOpen(false);
      const refreshed = await import("@/lib/actions/paquetes").then((m) => m.getPaquetes());
      setPaquetes(refreshed);
    } else {
      toast.error(res.error || "Error al guardar");
    }
    setSaving(false);
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
    const res = await deletePaquete(deleteId);
    if (res.success) {
      setPaquetes((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Paquete desactivado");
      setDeleteId(null);
    } else {
      toast.error(res.error || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="h-7 w-7 text-secondary" />
            Paquetes de Servicios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Combina servicios en paquetes con precio especial.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm">
          <PlusCircle className="h-4.5 w-4.5" />
          Nuevo Paquete
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Paquetes"
          value={totalPaquetes}
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          label="Paquetes Activos"
          value={activos}
          icon={<Gift className="h-5 w-5" />}
          iconColor="text-emerald-600"
          valueColor="text-emerald-600"
        />
        <StatsCard
          label="Valor Total"
          value={formatCurrency(valorTotal)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paquete..."
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(null);
          }}
          className="pl-9 pr-9 bg-card border-zinc-300 hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(null);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paquete</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-16">
                  <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium">
                    {search ? "Sin resultados para tu búsqueda" : "No hay paquetes registrados"}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground/60">
                    {search
                      ? "Prueba con otros términos o limpia el filtro"
                      : "Crea tu primer paquete combinando servicios"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{p.nombre}</div>
                    {p.descripcion && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.descripcion}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.servicios.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sin servicios</span>
                      ) : (
                        p.servicios.map((s) => (
                          <Badge key={s.id} variant="outline" className="text-xs font-normal">
                            <Layers className="h-3 w-3 mr-1" />
                            {s.nombre}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(parseFloat(p.precio))}</TableCell>
                  <TableCell>
                    <Badge variant={p.activo ? "default" : "secondary"} className="text-xs">
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggle(p.id)} title={p.activo ? "Desactivar" : "Activar"}>
                        {p.activo ? <PowerOff className="h-4 w-4 text-muted-foreground" /> : <Power className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} title="Eliminar">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Paquete" : "Nuevo Paquete"}</SheetTitle>
            <SheetDescription>
              {editingId ? "Modifica los datos del paquete y sus servicios." : "Crea un nuevo paquete combinando servicios."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Paquete *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Lavado Completo + Cera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                className="w-full bg-card border border-border rounded-lg text-sm p-3 outline-none focus:border-primary resize-none"
                placeholder="Describe brevemente lo que incluye este paquete..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio Total (S/) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="99.90"
              />
            </div>

            <div className="space-y-3">
              <Label>Servicios Incluidos</Label>
              <p className="text-xs text-muted-foreground">Selecciona los servicios que forman parte de este paquete.</p>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                {servicios
                  .filter((s) => s.nombre)
                  .map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          form.servicioIds.includes(s.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleServicio(s.id);
                        }}
                      >
                        {form.servicioIds.includes(s.id) && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{s.nombre}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(parseFloat(s.precio))}</div>
                      </div>
                    </label>
                  ))}
                {servicios.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay servicios disponibles</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <SheetClose className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-9 px-4 text-sm font-medium cursor-pointer">
              Cancelar
            </SheetClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar Paquete" : "Crear Paquete"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Paquete</DialogTitle>
            <DialogDescription>
              ¿Estás seguro? El paquete quedará inactivo y no estará disponible en nuevas órdenes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Desactivar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
