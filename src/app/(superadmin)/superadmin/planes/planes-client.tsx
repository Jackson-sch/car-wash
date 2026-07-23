"use client";

import { useState, useRef } from "react";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPlan, updatePlan, deletePlan } from "@/lib/actions/planes";
import { toast } from "sonner";
import { PlanCard } from "./components/PlanCard";
import { PlanFormSheet } from "./components/PlanFormSheet";
import type { PlanFormData } from "./components/PlanFormSheet";

interface PlanItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  limiteSucursales: number | null;
  limiteUsuarios: number | null;
  features: Record<string, boolean>;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PlanesClientProps {
  initialPlanes: PlanItem[];
}

const FEATURE_LABELS: Record<string, string> = {
  ordenes: "Órdenes de Servicio",
  clientes: "Clientes",
  vehiculos: "Vehículos",
  reportes: "Reportes",
  inventario: "Inventario",
  cupones: "Cupones",
  empleados: "Empleados",
  soporte_prioritario: "Soporte Prioritario",
};

const emptyForm: PlanFormData = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio: "0",
  limiteSucursales: "",
  limiteUsuarios: "",
  features: Object.keys(FEATURE_LABELS).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as Record<string, boolean>),
};

export function PlanesClient({ initialPlanes }: PlanesClientProps) {
  const [planes, setPlanes] = useState<PlanItem[]>(initialPlanes);
  const [searchTerm, setSearchTerm] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deletingIdRef = useRef<string | null>(null);

  const [form, setForm] = useState<PlanFormData>(emptyForm);

  const filtered = planes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (plan: PlanItem) => {
    setEditingId(plan.id);
    setForm({
      codigo: plan.codigo,
      nombre: plan.nombre,
      descripcion: plan.descripcion || "",
      precio: plan.precio,
      limiteSucursales: plan.limiteSucursales?.toString() || "",
      limiteUsuarios: plan.limiteUsuarios?.toString() || "",
      features: { ...plan.features },
    });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error("El nombre del plan es obligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        precio: form.precio || "0",
        limiteSucursales: form.limiteSucursales ? parseInt(form.limiteSucursales) : null,
        limiteUsuarios: form.limiteUsuarios ? parseInt(form.limiteUsuarios) : null,
        features: form.features,
      };

      if (editingId) {
        const res = await updatePlan(editingId, payload);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        setPlanes((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  ...payload,
                  descripcion: payload.descripcion || null,
                  limiteSucursales: payload.limiteSucursales,
                  limiteUsuarios: payload.limiteUsuarios,
                }
              : p
          )
        );
        toast.success("Plan actualizado");
      } else {
        if (!form.codigo.trim()) {
          toast.error("El código del plan es obligatorio.");
          return;
        }
        const res = await createPlan({
          ...payload,
          codigo: form.codigo.trim().toLowerCase(),
        });
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("Plan creado");
      }

      setSheetOpen(false);
    } catch {
      toast.error("Error al guardar el plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    deletingIdRef.current = id;
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const idToDelete = deletingIdRef.current;
    if (!idToDelete) return;
    try {
      const res = await deletePlan(idToDelete);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setPlanes((prev) => prev.filter((p) => p.id !== idToDelete));
      toast.success("Plan eliminado");
    } catch {
      toast.error("Error al eliminar el plan");
    } finally {
      setDeleteDialogOpen(false);
      deletingIdRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto bg-muted/50 border border-border px-3 py-1.5 rounded-xl max-w-md">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar planes..."
            aria-label="Buscar planes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-sm text-foreground focus:outline-none w-full focus:ring-0 placeholder-muted-foreground"
          />
        </div>

        <Button
          onClick={openCreate}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer shadow-sm"
        >
          <PlusCircle className="size-4.5" />
          Nuevo Plan
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto rounded-2xl shadow-xs">
          <Package className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground text-sm">
            No se encontraron planes
          </p>
          <p className="text-xs text-muted-foreground/60">
            Intenta con otros términos o limpia el filtro de búsqueda.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEdit}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      <PlanFormSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        editingId={editingId}
        form={form}
        isSubmitting={isSubmitting}
        onFormChange={setForm}
        onSubmit={handleSave}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">¿Eliminar plan?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Esta acción no se puede deshacer. Las empresas con este plan no se verán afectadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-muted-foreground hover:text-foreground border border-border cursor-pointer rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer rounded-xl"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
