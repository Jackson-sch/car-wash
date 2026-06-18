"use client";

import { useState } from "react";
import {
  Package,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  BadgeDollarSign,
  Infinity,
  Check,
  X,
  ShieldCheck,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { createPlan, updatePlan, deletePlan } from "@/lib/actions/planes";
import { toast } from "sonner";

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

type PlanFormData = {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  limiteSucursales: string;
  limiteUsuarios: string;
  features: Record<string, boolean>;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deletePlan(deletingId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setPlanes((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Plan eliminado");
    } catch {
      toast.error("Error al eliminar el plan");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const formatLimit = (val: number | null) => {
    if (val === null) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Infinity className="size-3.5" />
          Ilimitado
        </span>
      );
    }
    return val;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto bg-muted/50 border border-border px-3 py-1.5 rounded-xl max-w-md">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar planes..."
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
          {filtered.map((plan) => {
            const isFree = parseFloat(plan.precio) === 0;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden border border-border bg-card/60 backdrop-blur-md hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 rounded-2xl flex flex-col justify-between ${
                  !plan.activo ? "opacity-75 dark:opacity-65" : ""
                }`}
              >
                {/* Background glow orbs for premium aesthetics */}
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
                <div className="absolute -left-12 bottom-1/3 h-24 w-24 rounded-full bg-primary/3 blur-2xl pointer-events-none" />

                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  {/* Top Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
                        <Package className="size-5" />
                      </div>
                      <Badge
                        className={`border-0 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          plan.activo
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {plan.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-black tracking-tight text-foreground">{plan.nombre}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="text-[9px] font-mono bg-muted/65 text-muted-foreground px-1.5 py-0.5 rounded">
                          {plan.codigo}
                        </code>
                      </div>
                    </div>

                    {plan.descripcion && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {plan.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="py-4 border-t border-b border-border/50 my-2">
                    <div className="flex items-baseline gap-1">
                      {isFree ? (
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Gratuito</span>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-muted-foreground mr-0.5">S/</span>
                          <span className="text-3xl font-black tracking-tight text-foreground">
                            {parseFloat(plan.precio).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold"> /mes</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      Límites del Plan
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <MapPin className="size-3.5 text-secondary" />
                      <span>Sucursales: {formatLimit(plan.limiteSucursales)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <Users className="size-3.5 text-secondary" />
                      <span>Usuarios: {formatLimit(plan.limiteUsuarios)}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs border-t border-border/50 pt-4 mt-2">
                    <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Características
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                        const hasFeature = plan.features[key];
                        return (
                          <div key={key} className="flex items-center gap-2.5 text-muted-foreground">
                            {hasFeature ? (
                              <Check className="size-4 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="size-4 text-rose-500/60 shrink-0" />
                            )}
                            <span className={`text-xs ${hasFeature ? "text-foreground font-bold" : "line-through opacity-40 font-medium"}`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-muted/40 border-t border-border/50 flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(plan)}
                    className="h-8 text-[10px] font-bold rounded-lg border-border hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-muted/50 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground shadow-xs px-3"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(plan.id)}
                    className="h-8 text-[10px] font-bold rounded-lg border-border hover:border-destructive hover:bg-destructive/5 hover:text-destructive gap-1.5 cursor-pointer text-muted-foreground shadow-xs px-3"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-foreground">
              {editingId ? "Editar Plan" : "Nuevo Plan"}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {editingId
                ? "Modifica las propiedades del plan de suscripción."
                : "Define un nuevo plan de suscripción con sus límites y características."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Información General</h3>

              {!editingId && (
                <div className="space-y-1.5">
                  <Label htmlFor="codigo" className="text-xs font-semibold text-foreground">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ej. premium"
                    className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">Identificador único usado en la base de datos.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Plan Premium"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">Descripción</Label>
                <textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Describe brevemente este plan..."
                  rows={2}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring resize-none placeholder-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="precio" className="text-xs font-semibold text-foreground">
                  Precio Mensual (S/)
                </Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Límites</h3>
              <p className="text-[10px] text-muted-foreground -mt-2">Dejar vacío = Ilimitado</p>

              <div className="space-y-1.5">
                <Label htmlFor="limiteSucursales" className="text-xs font-semibold text-foreground">
                  Máximo de Sucursales
                </Label>
                <Input
                  id="limiteSucursales"
                  type="number"
                  min="0"
                  value={form.limiteSucursales}
                  onChange={(e) => setForm({ ...form, limiteSucursales: e.target.value })}
                  placeholder="Ilimitado"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="limiteUsuarios" className="text-xs font-semibold text-foreground">
                  Máximo de Usuarios
                </Label>
                <Input
                  id="limiteUsuarios"
                  type="number"
                  min="0"
                  value={form.limiteUsuarios}
                  onChange={(e) => setForm({ ...form, limiteUsuarios: e.target.value })}
                  placeholder="Ilimitado"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Características</h3>

              <div className="space-y-3">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`feature-${key}`} className="text-xs font-medium text-foreground cursor-pointer">
                      {label}
                    </Label>
                    <Switch
                      id={`feature-${key}`}
                      checked={form.features[key] || false}
                      onCheckedChange={(checked) =>
                        setForm({
                          ...form,
                          features: { ...form.features, [key]: checked },
                        })
                      }
                      className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <SheetClose
                render={
                  <Button type="button" variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground border border-border py-5.5 rounded-xl cursor-pointer">
                    Cancelar
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-5.5 rounded-xl cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : editingId ? "Actualizar Plan" : "Crear Plan"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

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
