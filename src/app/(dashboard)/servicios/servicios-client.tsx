"use client";

import { useState, useTransition } from "react";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import {
  createServicio,
  updateServicio,
  deleteServicio,
  preCargarServiciosDemo,
  createCategoriaServicio,
  updateCategoriaServicio,
  deleteCategoriaServicio,
} from "@/lib/actions/servicios";
import { toast } from "sonner";

import { ServiciosCategoryTabs } from "./components/ServiciosCategoryTabs";
import type { Servicio, Categoria } from "./components/ServiciosGrid";
import { ServiciosGrid } from "./components/ServiciosGrid";
import { ServiciosKpiCards } from "./components/ServiciosKpiCards";
import { ServicioModal } from "./components/ServicioModal";
import { CategoriaModal } from "./components/CategoriaModal";
import { RecetaModal, type InsumoDisponible } from "./components/RecetaModal";

interface ServiciosClientProps {
  initialServicios: Servicio[];
  initialCategorias: Categoria[];
  insumosDisponibles?: InsumoDisponible[];
}

const EMPTY_INSUMOS: InsumoDisponible[] = [];

export function ServiciosClient({
  initialServicios,
  initialCategorias,
  insumosDisponibles = EMPTY_INSUMOS,
}: ServiciosClientProps) {
  const [servicios, setServicios] = useState<Servicio[]>(initialServicios);
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [activeTab, setActiveTab] = useQueryState("categoria", {
    defaultValue: "todos",
    shallow: true,
    history: "replace",
  });
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [recetaFilter, setRecetaFilter] = useState<"todos" | "con_receta" | "sin_receta">("todos");
  const [isPending, startTransition] = useTransition();

  // Estados del modal de servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  // Estado del modal de nueva categoría
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Estado del modal de receta de insumos
  const [isRecetaOpen, setIsRecetaOpen] = useState(false);
  const [recetaServicio, setRecetaServicio] = useState<Servicio | null>(null);

  const handleOpenReceta = (serv: Servicio) => {
    setRecetaServicio(serv);
    setIsRecetaOpen(true);
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingServicio(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (serv: Servicio) => {
    setEditingServicio(serv);
    setIsModalOpen(true);
  };

  // Duplicar servicio (prefill con id vacío para crear uno nuevo)
  const handleDuplicate = (serv: Servicio) => {
    setEditingServicio({
      ...serv,
      id: "",
      nombre: `${serv.nombre} (Copia)`,
    });
    setIsModalOpen(true);
  };

  // Guardar servicio (Crear o Editar)
  const handleSaveServicio = async (data: {
    nombre: string;
    descripcion: string;
    precio: string;
    duracionMin: string;
    categoriaId: string;
    aplicaA: string[];
  }) => {
    startTransition(async () => {
      if (editingServicio && editingServicio.id) {
        // Actualizar
        const res = await updateServicio(editingServicio.id, {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          duracionMin: parseInt(data.duracionMin) || 30,
          categoriaId: data.categoriaId || null,
          aplicaA: data.aplicaA,
        });

        if (res.success && res.data) {
          toast.success("Servicio actualizado correctamente");
          setServicios((prev) =>
            prev.map((s) =>
              s.id === editingServicio.id
                ? ({
                    ...s,
                    ...res.data,
                    categoriaNombre:
                      categorias.find((c) => c.id === data.categoriaId)?.nombre || null,
                  } as Servicio)
                : s
            )
          );
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
      } else {
        // Crear
        const res = await createServicio({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          duracionMin: parseInt(data.duracionMin) || 30,
          categoriaId: data.categoriaId || null,
          aplicaA: data.aplicaA,
        });

        if (res.success && res.data) {
          toast.success("Servicio creado correctamente");
          const newServ: Servicio = {
            ...res.data,
            categoriaNombre:
              categorias.find((c) => c.id === data.categoriaId)?.nombre || null,
          } as Servicio;
          setServicios((prev) => [...prev, newServ]);
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
      }
    });
  };

  // Eliminar servicio
  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este servicio del catálogo?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteServicio(id);
      if (res.success) {
        toast.success("Servicio eliminado del catálogo");
        setServicios((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(res.error || "No se pudo eliminar");
      }
    });
  };

  // Pre-cargar datos de prueba
  const handleLoadDemo = async () => {
    startTransition(async () => {
      const res = await preCargarServiciosDemo();
      if (res.success) {
        toast.success("Catálogo demo cargado con éxito");
        window.location.reload();
      } else {
        toast.error(res.error || "Error al cargar demo");
      }
    });
  };

  // Crear categoría rápida
  const handleCreateCategory = async (nombre: string) => {
    startTransition(async () => {
      const res = await createCategoriaServicio(nombre);
      if (res.success && res.data) {
        toast.success("Categoría creada con éxito");
        setCategorias((prev) => [...prev, res.data as Categoria]);
      } else {
        toast.error(res.error || "Error al crear categoría");
      }
    });
  };

  // Renombrar categoría
  const handleUpdateCategory = async (id: string, nombre: string) => {
    startTransition(async () => {
      const res = await updateCategoriaServicio(id, nombre);
      if (res.success && res.data) {
        toast.success("Categoría actualizada");
        setCategorias((prev) =>
          prev.map((c) => (c.id === id ? { ...c, nombre } : c))
        );
        setServicios((prev) =>
          prev.map((s) => (s.categoriaId === id ? { ...s, categoriaNombre: nombre } : s))
        );
      } else {
        toast.error(res.error || "Error al actualizar categoría");
      }
    });
  };

  // Eliminar categoría
  const handleDeleteCategory = async (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoriaServicio(id);
      if (res.success) {
        toast.success("Categoría eliminada");
        setCategorias((prev) => prev.filter((c) => c.id !== id));
        setServicios((prev) =>
          prev.map((s) =>
            s.categoriaId === id ? { ...s, categoriaId: null, categoriaNombre: null } : s
          )
        );
        if (activeTab === id) setActiveTab("todos");
      } else {
        toast.error(res.error || "Error al eliminar categoría");
      }
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="h-7 w-7 text-secondary" />
            Catálogo de Servicios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los tipos de lavado, precios y tiempos de atención de tu sucursal.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsCatModalOpen(true)}
            className="font-bold gap-2 cursor-pointer h-10 rounded-xl border-border hover:bg-muted/80 text-foreground hover:text-foreground text-xs shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            Categorías
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm text-xs"
          >
            <Plus className="h-4 w-4" />
            Agregar Servicio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ServiciosKpiCards servicios={servicios} />

      {/* Filters & Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <ServiciosCategoryTabs
            categorias={categorias}
            activeTab={activeTab || "todos"}
            onTabChange={setActiveTab}
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shrink-0">
              {(
                [
                  { key: "todos", label: "Todos" },
                  { key: "con_receta", label: "Con Receta" },
                  { key: "sin_receta", label: "Sin Receta" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setRecetaFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    recetaFilter === f.key
                      ? "bg-secondary text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex-1 md:w-64">
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-xl text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ServiciosGrid Extracted Component */}
      <ServiciosGrid
        servicios={servicios}
        categorias={categorias}
        searchQuery={searchQuery || ""}
        activeTab={activeTab || "todos"}
        recetaFilter={recetaFilter}
        isPending={isPending}
        onEdit={handleOpenEdit}
        onDuplicate={handleDuplicate}
        onReceta={handleOpenReceta}
        onDelete={handleDelete}
        onLoadDemo={handleLoadDemo}
        onAddClick={handleOpenCreate}
      />


      {/* Service Modal Extracted Component */}
      <ServicioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        servicio={editingServicio}
        categorias={categorias}
        isPending={isPending}
        onSave={handleSaveServicio}
        onOpenNewCategoria={() => setIsCatModalOpen(true)}
      />

      {/* Categoria Modal Extracted Component */}
      <CategoriaModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        isPending={isPending}
        categorias={categorias}
        onSave={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Receta Modal Component */}
      {recetaServicio && (
        <RecetaModal
          open={isRecetaOpen}
          onOpenChange={setIsRecetaOpen}
          servicioId={recetaServicio.id}
          servicioNombre={recetaServicio.nombre}
          servicioPrecio={recetaServicio.precio}
          insumosDisponibles={insumosDisponibles}
          onSuccess={(totalItems, costoTotal) => {
            setServicios((prev) =>
              prev.map((s) =>
                s.id === recetaServicio.id
                  ? { ...s, totalInsumosReceta: totalItems, costoReceta: costoTotal }
                  : s
              )
            );
          }}
        />
      )}
    </div>
  );
}
