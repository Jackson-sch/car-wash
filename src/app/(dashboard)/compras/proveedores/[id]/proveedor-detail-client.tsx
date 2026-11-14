"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  Mail,
  Landmark,
  Edit3,
  Plus,
  ReceiptText,
  DollarSign,
  Calendar,
  MessageCircle,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import { ProveedorFormModal } from "../components/ProveedorFormModal";
import type { ProveedorDirectoryItem } from "../../types";

interface CompraHistorialItem {
  id: string;
  tipoComprobante: string;
  numeroComprobante: string;
  fechaEmision: Date;
  metodoPago: string;
  estado: string;
  total: string;
  itemsCount: number;
}

interface ProveedorDetailClientProps {
  proveedor: ProveedorDirectoryItem;
  comprasHistorial: CompraHistorialItem[];
}

const TIPO_DOC_LABELS: Record<string, string> = {
  factura: "Factura",
  boleta: "Boleta",
  guia: "Guía",
  nota: "Nota",
};

export function ProveedorDetailClient({
  proveedor,
  comprasHistorial,
}: ProveedorDetailClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const phoneDigits = (proveedor.telefono || "").replace(/\D/g, "");
  const waLink =
    phoneDigits.length >= 9
      ? `https://wa.me/${phoneDigits.startsWith("51") ? phoneDigits : `51${phoneDigits}`}`
      : null;

  const completadas = comprasHistorial.filter((c) => c.estado === "completada");
  const totalGastado = completadas.reduce((acc, c) => acc + parseFloat(c.total || "0"), 0);
  const ticketPromedio = completadas.length > 0 ? totalGastado / completadas.length : 0;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header / Breadcrumb Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/compras/proveedores">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border bg-card/60"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {proveedor.razonSocial}
              </h1>
              {proveedor.activo ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold"
                >
                  Activo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Inactivo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {proveedor.ruc ? `RUC: ${proveedor.ruc}` : "Sin RUC registrado"}
              {proveedor.nombreComercial ? ` • ${proveedor.nombreComercial}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold gap-1.5"
              >
                <MessageCircle className="size-3.5" />
                <span>WhatsApp</span>
              </Button>
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="rounded-xl border-border bg-card/60 text-xs font-bold gap-1.5"
          >
            <Edit3 className="size-3.5 text-secondary" />
            <span>Editar Datos</span>
          </Button>

          <Link href={`/compras/nueva?proveedorId=${proveedor.id}`}>
            <Button
              size="sm"
              className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-bold gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Nueva Compra</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Compactos */}
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          <div className="p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <ReceiptText className="size-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Comprobantes
              </span>
              <span className="text-lg font-black font-mono text-foreground">
                {completadas.length}
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <DollarSign className="size-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Total Comprado
              </span>
              <span className="text-lg font-black font-mono text-emerald-500">
                {formatCurrency(totalGastado)}
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <Building2 className="size-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Compra Promedio
              </span>
              <span className="text-lg font-black font-mono text-foreground">
                {formatCurrency(ticketPromedio)}
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Calendar className="size-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Última Factura
              </span>
              <span className="text-xs font-bold font-mono text-foreground">
                {comprasHistorial[0]
                  ? new Date(comprasHistorial[0].fechaEmision).toLocaleDateString("es-PE")
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Contacto & Bancaria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building2 className="size-3.5 text-secondary" />
            <span>Datos de Contacto y Ubicación</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Asesor / Contacto</span>
              <span className="font-semibold text-foreground">
                {proveedor.contactoNombre || "No especificado"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="size-3" /> Teléfono
              </span>
              <span className="font-mono font-semibold text-foreground">
                {proveedor.telefono || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" /> Correo
              </span>
              <span className="text-foreground">{proveedor.email || "—"}</span>
            </div>
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                <MapPin className="size-3" /> Dirección
              </span>
              <span className="text-foreground text-right">{proveedor.direccion || "—"}</span>
            </div>
          </div>
        </Card>

        <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Landmark className="size-3.5 text-emerald-500" />
            <span>Cuentas Bancarias y Condiciones</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Entidad Bancaria</span>
              <span className="font-semibold text-foreground">
                {proveedor.banco || "No especificado"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">N° Cuenta</span>
              <span className="font-mono font-bold text-foreground">
                {proveedor.cuentaBancaria || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Código CCI</span>
              <span className="font-mono font-bold text-foreground">
                {proveedor.cci || "—"}
              </span>
            </div>
            <div className="py-1">
              <span className="text-muted-foreground block mb-1">Notas comerciales:</span>
              <p className="text-foreground/90 text-[11px] bg-muted/30 p-2 rounded-lg">
                {proveedor.notas || "Sin notas registradas."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Historial de Facturas / Boletas del Proveedor */}
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
            <ReceiptText className="size-4 text-secondary" />
            <span>Historial de Comprobantes ({comprasHistorial.length})</span>
          </h2>
        </div>

        {comprasHistorial.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Este proveedor aún no tiene facturas o boletas registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-2.5 px-4">Comprobante</th>
                  <th className="py-2.5 px-4">Fecha Emisión</th>
                  <th className="py-2.5 px-4">Forma de Pago</th>
                  <th className="py-2.5 px-4 text-center">Ítems</th>
                  <th className="py-2.5 px-4 text-center">Estado</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comprasHistorial.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1.5">
                        {TIPO_DOC_LABELS[c.tipoComprobante] || c.tipoComprobante}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {c.numeroComprobante}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      {new Date(c.fechaEmision).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-2.5 px-4 capitalize text-foreground">{c.metodoPago}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{c.itemsCount}</td>
                    <td className="py-2.5 px-4 text-center">
                      {c.estado === "completada" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] gap-1"
                        >
                          <CheckCircle2 className="size-3" /> Completada
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] gap-1"
                        >
                          <XCircle className="size-3" /> Anulada
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-foreground">
                      {formatCurrency(parseFloat(c.total || "0"))}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link href={`/compras/${c.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 rounded-lg text-secondary hover:bg-secondary/10"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProveedorFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        proveedor={proveedor}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
