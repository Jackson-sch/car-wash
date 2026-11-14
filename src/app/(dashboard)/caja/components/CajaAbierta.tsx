"use client";

import type { TurnoActivo } from "./types";
import { CajaKpis } from "./CajaKpis";
import { CajaSummaryCard } from "./CajaSummaryCard";
import { SalesByCategoryChart } from "./SalesByCategoryChart";
import { HourlyVolumeChart } from "./HourlyVolumeChart";

interface CajaAbiertaProps {
  turno: TurnoActivo;
}

export function CajaAbierta({ turno }: CajaAbiertaProps) {
  return (
    <div className="space-y-6">
      {/* 4 KPIs Financieros de Alto Nivel */}
      <CajaKpis turno={turno} />

      {/* Bento Grid: Desglose Operativo & Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Arqueo y Desglose Financiero (Izquierda) */}
        <CajaSummaryCard turno={turno} />

        {/* Gráficos Operativos (Derecha) */}
        <div className="col-span-1 md:col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalesByCategoryChart ventasPorCategoria={turno.ventasPorCategoria} />
          <HourlyVolumeChart ventasPorHora={turno.ventasPorHora} />
        </div>
      </div>
    </div>
  );
}
