"use client";

import { useState } from "react";
import { DetalleHeader } from "./components/DetalleHeader";
import { ProveedorCard } from "./components/ProveedorCard";
import { InsumosTable } from "./components/InsumosTable";
import { TotalesDesgloseCard } from "./components/TotalesDesgloseCard";
import { AnularModal } from "./components/AnularModal";
import type { CompraItem } from "../types";

interface CompraDetalleClientProps {
  compra: CompraItem;
}

export function CompraDetalleClient({ compra }: CompraDetalleClientProps) {
  const [isAnularOpen, setIsAnularOpen] = useState(false);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header con botones volver, imprimir y anular */}
      <DetalleHeader compra={compra} onOpenAnular={() => setIsAnularOpen(true)} />

      {/* 2. Tarjeta resumen del proveedor y documento */}
      <ProveedorCard compra={compra} />

      {/* 3. Grid de Insumos + Liquidación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <InsumosTable detalles={compra.detalles} />
        </div>
        <div className="lg:col-span-4 lg:sticky lg:top-4">
          <TotalesDesgloseCard compra={compra} />
        </div>
      </div>

      {/* Modal de confirmación para anulación */}
      <AnularModal
        compraId={compra.id}
        numeroComprobante={compra.numeroComprobante}
        open={isAnularOpen}
        onOpenChange={setIsAnularOpen}
      />
    </div>
  );
}
