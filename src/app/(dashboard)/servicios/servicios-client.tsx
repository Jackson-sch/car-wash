"use client";

import { useState, useTransition } from "react";
import { Layers, Coins, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import {
  createServicio,
  updateServicio,
  deleteServicio,
  preCargarServiciosDemo,
  createCategoriaServicio,
} from "@/lib/actions/servicios";
import { toast } from "sonner";

import { ServiciosCategoryTabs } from "./components/ServiciosCategoryTabs";
import { ServiciosGrid, Servicio, Categoria } from "./components/ServiciosGrid";
import { ServicioModal } from "./components/ServicioModal";
import { CategoriaModal } from "./components/CategoriaModal";
import { formatCurrency } from "@/lib/formats";

interface ServiciosClientProps {
  initialServicios: Servicio[];
  initialCategorias: Categoria[];
}

export function ServiciosClient({
  initialServicios,
  initialCategorias,
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
  const [isPending, startTransition] = useTransition();


  // Estados del modal de servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  // Estado del modal de nueva categoría
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

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
      if (editingServicio) {
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
        setIsCatModalOpen(false);
      } else {
        toast.error(res.error || "Error al crear categoría");
      }
    });
  };

  // KPIs dinámicos
  const totalActivos = servicios.length;
  const precioPromedio =
    servicios.length > 0
      ? servicios.reduce((acc, curr) => acc + parseFloat(curr.precio || "0"), 0) / servicios.length
      : 0;
  const tiempoPromedio =
    servicios.length > 0
      ? servicios.reduce((acc, curr) => acc + (curr.duracionMin || 0), 0) / servicios.length
      : 0;

  return (
    <div className="space-y-8 text-foreground">
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
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreate}
            className="font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Agregar Servicio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Servicios */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total de Servicios
              </span>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalActivos} <span className="text-sm font-medium text-muted-foreground">servicios</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Tipos de lavado y mantenimiento</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 2: Precio Promedio */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Precio Promedio
              </span>
              <h3 className="text-3xl font-extrabold text-emerald-500 tracking-tight">
                {formatCurrency(precioPromedio)}
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110 duration-300">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Costo promedio de lavado base</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 3: Duración Promedio */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Duración Promedio
              </span>
              <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
                {Math.round(tiempoPromedio)} <span className="text-sm font-medium text-muted-foreground">min</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Tiempo estimado de servicio</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <ServiciosCategoryTabs
          categorias={categorias}
          activeTab={activeTab || "todos"}
          onTabChange={setActiveTab}
        />

        <div className="w-full md:w-72">
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-zinc-300 hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
          />
        </div>
      </div>

      {/* ServiciosGrid Extracted Component */}
      <ServiciosGrid
        servicios={servicios}
        categorias={categorias}
        searchQuery={searchQuery || ""}
        activeTab={activeTab || "todos"}
        isPending={isPending}
        onEdit={handleOpenEdit}
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
        onSave={handleCreateCategory}
      />
    </div>
  );
}
