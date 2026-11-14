"use client";

import { Car, ChevronRight, Plus, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { VehiculoItem } from "../types";

interface ClienteVehiculosCardProps {
  vehiculos: VehiculoItem[];
}

export function ClienteVehiculosCard({ vehiculos }: ClienteVehiculosCardProps) {
  return (
    <Card className="border border-border bg-card rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Car className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              Flota de Vehículos ({vehiculos.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Unidades vehiculares registradas a nombre de este cliente.
            </p>
          </div>
        </div>

        <Link href="/vehiculos">
          <Badge
            variant="outline"
            className="text-[10px] font-bold border-border hover:bg-muted text-muted-foreground cursor-pointer"
          >
            Directorio Flota
          </Badge>
        </Link>
      </div>

      <div className="space-y-2.5">
        {vehiculos.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl p-4">
            <Car className="size-8 opacity-40 mx-auto mb-2 text-secondary" />
            <p className="text-xs font-bold text-foreground">Sin vehículos registrados</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Este cliente aún no tiene autos vinculados en el sistema.
            </p>
          </div>
        ) : (
          vehiculos.map((v) => (
            <Link
              key={v.id}
              href={`/vehiculos/${v.id}`}
              className="group block p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-secondary/40 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Peruvian License Plate Badge */}
                  <div className="px-2.5 py-1 rounded-lg border-2 border-foreground/80 bg-card font-mono font-black text-xs sm:text-sm tracking-wider text-foreground shadow-2xs shrink-0 group-hover:border-secondary transition-colors">
                    {v.placa}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-foreground truncate group-hover:text-secondary transition-colors">
                      {v.marca || "Marca no especificada"} {v.modelo || ""}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-medium">
                      {v.tipo && (
                        <span className="capitalize bg-card px-1.5 py-0.5 rounded-md border border-border/60">
                          {v.tipo}
                        </span>
                      )}
                      {v.color && <span>Color: {v.color}</span>}
                      {v.anio && <span>Año: {v.anio}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-secondary shrink-0 transition-colors">
                  <span className="hidden sm:inline text-[11px]">Ver Auto</span>
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
