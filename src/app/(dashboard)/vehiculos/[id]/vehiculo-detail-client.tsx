"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { DetailData } from "./types";

// Import modular components
import { VehiculoHero } from "./components/VehiculoHero";
import { VehiculoStats } from "./components/VehiculoStats";
import { ClienteCard } from "./components/ClienteCard";
import { EspecificacionesCard } from "./components/EspecificacionesCard";
import { HistorialServicios } from "./components/HistorialServicios";
import { VehiculoEditModal } from "./components/VehiculoEditModal";

export function VehiculoDetailClient({ data }: { data: DetailData }) {
  const { vehiculo: v, ordenes } = data;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Compute metrics for the Stats Bento Grid
  const totalGastado = useMemo(
    () => ordenes.reduce((acc, o) => acc + (o.total ? parseFloat(o.total) : 0), 0),
    [ordenes]
  );

  const ordenesActivas = useMemo(
    () => ordenes.filter((o) => o.estado === "pendiente" || o.estado === "en_proceso").length,
    [ordenes]
  );

  const ultimaOrden = ordenes[0];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 transition-opacity duration-300">
      {/* Back to Vehicles List Link */}
      <Link
        href="/vehiculos"
        className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
      >
        <div className="h-7 w-7 rounded-lg border border-border/60 bg-card flex items-center justify-center shadow-xs group-hover:border-zinc-350 dark:group-hover:border-zinc-750 transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 duration-300" />
        </div>
        Volver a vehículos
      </Link>

      {/* Hero Header Card */}
      <VehiculoHero vehiculo={v} onEditClick={() => setIsEditModalOpen(true)} />

      {/* Bento Grid Stats */}
      <VehiculoStats
        ordenes={ordenes}
        totalGastado={totalGastado}
        ordenesActivas={ordenesActivas}
        ultimaOrden={ultimaOrden}
      />

      {/* Layout Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Owner & Technical Specifications */}
        <div className="md:col-span-5 space-y-6">
          <ClienteCard vehiculo={v} />
          <EspecificacionesCard vehiculo={v} />
        </div>

        {/* Right Column: Interactive Service History Timeline */}
        <div className="md:col-span-7 space-y-6">
          <HistorialServicios vehiculoId={v.id} ordenes={ordenes} />
        </div>
      </div>

      {/* Edit Vehicle Dialog Modal */}
      {isEditModalOpen && (
        <VehiculoEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          vehiculo={v}
        />
      )}
    </div>
  );
}
