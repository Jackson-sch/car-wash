"use client";

import Link from "next/link";
import {
  Car,
  Truck,
  Bike,
  Van,
  Eye,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { PaginationControls } from "@/components/shared/PaginationControls";
import type { VehiculoItem } from "../types";
import { TIPO_LABELS } from "../types";

interface VehiculosTableProps {
  vehiculos: VehiculoItem[];
  activePage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number | null) => void;
}

const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS.at(hash) ?? AVATAR_COLORS[0]!;
}

function getTipoIcon(tipo: string | null) {
  const t = (tipo || "").toLowerCase();
  switch (t) {
    case "pickup":
    case "camion":
      return <Truck className="size-4 text-secondary" />;
    case "moto":
      return <Bike className="size-4 text-secondary" />;
    case "furgon":
      return <Van className="size-4 text-secondary" />;
    case "suv":
    case "sedan":
    default:
      return <Car className="size-4 text-secondary" />;
  }
}

export function VehiculosTable({
  vehiculos,
  activePage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: VehiculosTableProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-3.5 pl-4 text-center w-36">Placa Oficial</th>
              <th className="p-3.5">Vehículo & Categoría</th>
              <th className="p-3.5">Propietario / Cliente</th>
              <th className="p-3.5">Contacto</th>
              <th className="p-3.5 text-center">Historial</th>
              <th className="p-3.5 text-right pr-4">Ficha Técnica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {vehiculos.map((v) => {
              const fullName = `${v.clienteNombre} ${v.clienteApellido || ""}`.trim();
              const initials = `${v.clienteNombre?.[0] || ""}${v.clienteApellido?.[0] || ""}`.toUpperCase() || "C";
              const avatarColor = getAvatarColor(fullName);

              const cleanPhone = v.clienteTelefono?.replace(/\D/g, "") || "";
              const whatsappUrl = cleanPhone
                ? `https://wa.me/51${cleanPhone.startsWith("51") ? cleanPhone.slice(2) : cleanPhone}`
                : null;

              return (
                <tr
                  key={v.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Placa Peruana Oficial */}
                  <td className="p-3.5 pl-4 text-center">
                    <div className="inline-flex">
                      <VehiclePlate plate={v.placa} size="sm" />
                    </div>
                  </td>

                  {/* Vehículo & Categoría */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                        {getTipoIcon(v.tipo)}
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground text-xs leading-tight">
                          {v.marca || "—"} {v.modelo || ""}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold px-1.5 py-0 h-4 bg-muted/40 border-border text-muted-foreground uppercase"
                          >
                            {TIPO_LABELS[v.tipo || ""] || v.tipo || "Sedán"}
                          </Badge>
                          {v.anio && (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {v.anio}
                            </span>
                          )}
                          {v.color && (
                            <>
                              <span className="text-[8px] text-muted-foreground/50">•</span>
                              <span className="text-[10px] text-muted-foreground font-semibold capitalize">
                                {v.color}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Propietario / Cliente */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-7 rounded-lg border flex items-center justify-center text-[10px] font-extrabold shrink-0 ${avatarColor}`}
                      >
                        {initials}
                      </div>
                      <span className="font-bold text-foreground text-xs truncate max-w-[170px]">
                        {fullName}
                      </span>
                    </div>
                  </td>

                  {/* Contacto & WhatsApp */}
                  <td className="p-3.5">
                    {cleanPhone ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {v.clienteTelefono}
                        </span>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors"
                            title={`Enviar WhatsApp a ${fullName}`}
                          >
                            <MessageCircle className="size-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">—</span>
                    )}
                  </td>

                  {/* Historial de Órdenes */}
                  <td className="p-3.5 text-center">
                    {v.totalOrdenes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {v.totalOrdenes} {v.totalOrdenes === 1 ? "orden" : "órdenes"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        0 órdenes
                      </span>
                    )}
                  </td>

                  {/* Acciones: Ver Ficha Técnica */}
                  <td className="p-3.5 pr-4 text-right">
                    <Link href={`/vehiculos/${v.id}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-xl"
                      >
                        <Eye className="size-3.5 text-secondary" />
                        <span className="hidden sm:inline">Ver Ficha</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="p-4 border-t border-border bg-muted/10">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showInfo
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
}
