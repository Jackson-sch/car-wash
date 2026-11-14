"use client";

import {
  Building2,
  Phone,
  Landmark,
  Edit3,
  Plus,
  Eye,
  MessageCircle,
  CheckCircle2,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/formats";
import type { ProveedorDirectoryItem } from "../../types";

interface ProveedoresTableProps {
  proveedores: ProveedorDirectoryItem[];
  onEdit: (prov: ProveedorDirectoryItem) => void;
  onNew: () => void;
}

export function ProveedoresTable({ proveedores, onEdit, onNew }: ProveedoresTableProps) {
  if (proveedores.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No se encontraron proveedores"
        description="Aún no hay proveedores que coincidan con tu búsqueda. Al registrar cualquier compra se agregan automáticamente aquí."
        action={{
          label: "Registrar Proveedor",
          onClick: onNew,
          icon: Plus,
        }}
      />
    );
  }

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <th className="py-3 px-4">Proveedor / Razón Social</th>
              <th className="py-3 px-4">RUC / Doc</th>
              <th className="py-3 px-4">Contacto & Teléfono</th>
              <th className="py-3 px-4">Datos Bancarios</th>
              <th className="py-3 px-4 text-right">Compras</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {proveedores.map((prov) => {
              const phoneDigits = (prov.telefono || "").replace(/\D/g, "");
              const waLink =
                phoneDigits.length >= 9
                  ? `https://wa.me/${phoneDigits.startsWith("51") ? phoneDigits : `51${phoneDigits}`}`
                  : null;

              return (
                <tr key={prov.id} className="hover:bg-muted/20 transition-colors">
                  {/* Razón Social */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/compras/proveedores/${prov.id}`}
                      className="group inline-block"
                    >
                      <p className="font-bold text-foreground group-hover:text-secondary transition-colors">
                        {prov.razonSocial}
                      </p>
                      {prov.nombreComercial && (
                        <p className="text-[11px] text-muted-foreground">
                          {prov.nombreComercial}
                        </p>
                      )}
                      {prov.direccion && (
                        <p className="text-[10px] text-muted-foreground/80 truncate max-w-[240px]">
                          {prov.direccion}
                        </p>
                      )}
                    </Link>
                  </td>

                  {/* RUC */}
                  <td className="py-3 px-4">
                    {prov.ruc ? (
                      <span className="font-mono font-bold text-foreground px-2 py-0.5 rounded-md bg-muted/40 border border-border/50">
                        {prov.ruc}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Sin RUC</span>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="py-3 px-4 space-y-0.5">
                    {prov.contactoNombre && (
                      <p className="font-semibold text-foreground text-[11px]">
                        {prov.contactoNombre}
                      </p>
                    )}
                    {prov.telefono ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {prov.telefono}
                        </span>
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            title="Escribir por WhatsApp"
                            className="inline-flex items-center justify-center size-5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageCircle className="size-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      !prov.contactoNombre && (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )
                    )}
                  </td>

                  {/* Datos Bancarios */}
                  <td className="py-3 px-4">
                    {prov.banco || prov.cuentaBancaria || prov.cci ? (
                      <div className="space-y-0.5">
                        {prov.banco && (
                          <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
                            <Landmark className="size-3 text-emerald-500" />
                            <span>{prov.banco}</span>
                          </div>
                        )}
                        {prov.cuentaBancaria && (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            Cta: {prov.cuentaBancaria}
                          </p>
                        )}
                        {prov.cci && (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            CCI: {prov.cci}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No registrado</span>
                    )}
                  </td>

                  {/* Compras realizadas */}
                  <td className="py-3 px-4 text-right">
                    <p className="font-mono font-black text-foreground">
                      {formatCurrency(prov.montoTotal)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {prov.totalCompras} {prov.totalCompras === 1 ? "compra" : "compras"}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-4 text-center">
                    {prov.activo ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold gap-1"
                      >
                        <CheckCircle2 className="size-3" /> Activo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground border-border text-[10px] font-bold gap-1"
                      >
                        <Ban className="size-3" /> Inactivo
                      </Badge>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/compras/nueva?proveedorId=${prov.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 rounded-lg text-[11px] font-bold gap-1 border-secondary/30 text-secondary hover:bg-secondary/10"
                          title="Registrar compra a este proveedor"
                        >
                          <Plus className="size-3" />
                          <span className="hidden xl:inline">Compra</span>
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(prov)}
                        className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Editar datos del proveedor"
                      >
                        <Edit3 className="size-3.5" />
                      </Button>

                      <Link href={`/compras/proveedores/${prov.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Ver ficha e historial de compras"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
