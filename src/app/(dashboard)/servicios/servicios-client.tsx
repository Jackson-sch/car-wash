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

import { StatsCard } from "@/components/shared/StatsCard";
import { ServiciosCategoryTabs } from "./components/ServiciosCategoryTabs";
import { ServiciosGrid, Servicio, Categoria } from "./components/ServiciosGrid";
import { ServicioModal } from "./components/ServicioModal";
import { CategoriaModal } from "./components/CategoriaModal";

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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
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
            className="bg-black hover:bg-zinc-800 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Agregar Servicio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Servicios"
          value={totalActivos}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatsCard
          label="Precio Promedio"
          value={`S/ ${precioPromedio.toFixed(2)}`}
          icon={<Coins className="h-5 w-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatsCard
          label="Duración Promedio"
          value={`${Math.round(tiempoPromedio)} min`}
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-blue-500"
        />
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
