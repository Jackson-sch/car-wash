"use client";

import { useState, useMemo } from "react";
import { Tag, Gift, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { CuponForm } from "./components/CuponForm";
import { CuponesSidebar } from "./components/CuponesSidebar";

interface ServicioType {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoriaNombre: string | null;
}

export function CuponesClient({
  initialCupones,
  servicios,
}: {
  initialCupones: any[];
  servicios: ServicioType[];
}) {
  const [editingCupon, setEditingCupon] = useState<any | null>(null);

  const totalCupones = initialCupones.length;
  const activos = initialCupones.filter((c: any) => c.activo).length;
  const totalUsos = useMemo(
    () => initialCupones.reduce((acc: number, c: any) => acc + (c.usos?.length || 0), 0),
    [initialCupones]
  );

  const handleEdit = (cupon: any) => {
    setEditingCupon(cupon);
  };

  const handleCancelEdit = () => {
    setEditingCupon(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Tag className="h-7 w-7 text-secondary" />
            Generador de Cupones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea y administra descuentos promocionales para tus clientes.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Cupones"
          value={totalCupones}
          icon={<Tag className="h-5 w-5" />}
        />
        <StatsCard
          label="Cupones Activos"
          value={activos}
          icon={<Gift className="h-5 w-5" />}
          iconColor="text-emerald-600"
          valueColor="text-emerald-600"
        />
        <StatsCard
          label="Canjes Totales"
          value={totalUsos}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="xl:col-span-2 space-y-6">
          <CuponForm
            servicios={servicios}
            editingCupon={editingCupon}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Right Column: Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <CuponesSidebar cupones={initialCupones} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
}
