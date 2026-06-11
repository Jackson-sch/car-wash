"use client";

import { TurnoActivo } from "./types";
import { CajaSummaryCard } from "./CajaSummaryCard";
import { SalesByCategoryChart } from "./SalesByCategoryChart";
import { HourlyVolumeChart } from "./HourlyVolumeChart";
import { TransactionsTable } from "./TransactionsTable";

interface CajaAbiertaProps {
  turno: TurnoActivo;
}

export function CajaAbierta({ turno }: CajaAbiertaProps) {
  return (
    <div className="space-y-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Caja Summary Card (Left Side) */}
        <CajaSummaryCard turno={turno} />

        {/* Charts Area (Right Side) */}
        <div className="col-span-1 md:col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalesByCategoryChart ventasPorCategoria={turno.ventasPorCategoria} />
          <HourlyVolumeChart ventasPorHora={turno.ventasPorHora} />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsTable transacciones={turno.transaccionesDetalladas} />
    </div>
  );
}
