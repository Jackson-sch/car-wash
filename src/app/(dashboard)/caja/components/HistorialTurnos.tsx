"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQueryState, parseAsInteger } from "nuqs";
import type { TurnoHistorial } from "./types";
import { HistorialTurnosTable } from "./HistorialTurnosTable";
import { TurnoCierreDetailSheet } from "./TurnoCierreDetailSheet";

interface HistorialTurnosProps {
  historial: TurnoHistorial[];
}

export function HistorialTurnos({ historial }: HistorialTurnosProps) {
  const [selectedTurno, setSelectedTurno] = useState<TurnoHistorial | null>(null);

  const [currentPage, setCurrentPage] = useQueryState(
    "hpage",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const itemsPerPage = 5;
  const activePage = currentPage || 1;
  const totalPages = Math.ceil(historial.length / itemsPerPage) || 1;

  const paginatedHistorial = historial.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
        <History className="h-4.5 w-4.5 text-muted-foreground" />
        Historial de Turnos de Caja
      </h2>
      
      {historial.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground border-border bg-card text-xs">
          Aún no se registran cierres de caja históricos en esta sucursal.
        </Card>
      ) : (
        <HistorialTurnosTable 
          historial={paginatedHistorial} 
          onSelectTurno={setSelectedTurno} 
          activePage={activePage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={historial.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <TurnoCierreDetailSheet 
        selectedTurno={selectedTurno} 
        onClose={() => setSelectedTurno(null)} 
      />
    </div>
  );
}
