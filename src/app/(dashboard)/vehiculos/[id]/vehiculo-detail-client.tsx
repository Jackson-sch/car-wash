"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  ClipboardList,
  User,
  Phone,
  Mail,
  Calendar,
  PlusCircle,
  Clock,
  DollarSign,
  Gauge,
  AlertCircle,
  Truck,
  Bike,
  Van,
  Wrench,
  CheckCircle2,
  XCircle,
  Zap,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatCurrency, getInitials, formatDate, formatShortDate, formatLongDate } from "@/lib/formats";

interface VehiculoData {
  id: string;
  placa: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  notas: string | null;
  activo: boolean | null;
  createdAt: Date | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
}

interface OrdenItem {
  id: string;
  nroTicket: string | null;
  estado: string;
  total: string | null;
  prioridad: number | null;
  notas: string | null;
  createdAt: Date | null;
  servicios: string;
}

interface DetailData {
  vehiculo: VehiculoData;
  ordenes: OrdenItem[];
}

const TIPO_LABELS: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pick-up",
  moto: "Moto",
  camion: "Camión",
  furgon: "Furgón",
  otro: "Otro",
};

function TipoIcon({ tipo, className = "h-5 w-5" }: { tipo: string | null; className?: string }) {
  switch (tipo) {
    case "sedan":
    case "suv":
      return <Car className={className} />;
    case "pickup":
      return <Truck className={className} />;
    case "moto":
      return <Bike className={className} />;
    case "camion":
      return <Truck className={className} />;
    case "furgon":
      return <Van className={className} />;
    default:
      return <Car className={className} />;
  }
}



const ESTADO_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pendiente: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-5 w-5" /> },
  en_proceso: { label: "En Proceso", variant: "default", icon: <Wrench className="h-5 w-5" /> },
  completado: { label: "Completado", variant: "outline", icon: <CheckCircle2 className="h-5 w-5" /> },
  cobrado: { label: "Cobrado", variant: "default", icon: <DollarSign className="h-5 w-5" /> },
  cancelado: { label: "Cancelado", variant: "destructive", icon: <XCircle className="h-5 w-5" /> },
};

function OwnerAvatar({ nombre, apellido }: { nombre: string; apellido?: string | null }) {
  const initials = getInitials(nombre, apellido || "");
  return (
    <div className="h-12 w-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm font-bold shrink-0">
      {initials || <User className="h-5 w-5" />}
    </div>
  );
}

export function VehiculoDetailClient({ data }: { data: DetailData }) {
  const { vehiculo: v, ordenes } = data;

  const totalGastado = useMemo(
    () => ordenes.reduce((acc, o) => acc + (o.total ? parseFloat(o.total) : 0), 0),
    [ordenes]
  );

  const ordenesActivas = ordenes.filter(
    (o) => o.estado === "pendiente" || o.estado === "en_proceso"
  ).length;

  const ultimaOrden = ordenes[0];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/vehiculos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a vehículos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <TipoIcon tipo={v.tipo} className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono tracking-widest uppercase">
                {v.placa}
              </h1>
              <Badge variant={v.activo ? "default" : "secondary"} className="text-xs">
                {v.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {v.marca || "—"} {v.modelo || ""} &middot;{" "}
              {TIPO_LABELS[v.tipo || ""] || v.tipo || "—"}
              {v.anio && <> &middot; {v.anio}</>}
            </p>
          </div>
        </div>
        <Link href={`/ordenes/nueva?vehiculoId=${v.id}`}>
          <Button className="gap-2 cursor-pointer bg-secondary hover:bg-secondary/90 text-white font-bold shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Total Órdenes"
          value={ordenes.length}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatsCard
          label="Total Gastado"
          value={formatCurrency(totalGastado)}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="text-emerald-600"
          valueColor="text-emerald-600"
        />
        <StatsCard
          label="Órdenes Activas"
          value={ordenesActivas}
          icon={<Gauge className="h-5 w-5" />}
          iconColor="text-amber-600"
          valueColor="text-amber-600"
        />
        <StatsCard
          label={ultimaOrden ? "Última Visita" : "Sin Actividad"}
          value={
            ultimaOrden?.createdAt
              ? formatDate(ultimaOrden.createdAt)
              : "—"
          }
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Card */}
        <Card className="p-5 border-border bg-card shadow-sm hover:border-zinc-350 transition-all">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <User className="h-4 w-4" />
            Propietario
          </h3>
          <div className="flex items-start gap-3">
            <OwnerAvatar nombre={v.clienteNombre} apellido={v.clienteApellido} />
            <div>
              <Link
                href={`/clientes?search=${encodeURIComponent(v.clienteNombre)}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {v.clienteNombre} {v.clienteApellido || ""}
              </Link>
              <div className="mt-2 space-y-1">
                {v.clienteTelefono && (
                  <a
                    href={`tel:${v.clienteTelefono}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {v.clienteTelefono}
                  </a>
                )}
                {v.clienteEmail && (
                  <a
                    href={`mailto:${v.clienteEmail}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {v.clienteEmail}
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Details Card */}
        <Card className="p-5 border-border bg-card shadow-sm hover:border-zinc-350 transition-all">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <Car className="h-4 w-4" />
            Detalles del Vehículo
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Color</span>
              <span className="font-medium text-foreground">
                {v.color || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <TipoIcon tipo={v.tipo} className="h-4 w-4" />
                {TIPO_LABELS[v.tipo || ""] || v.tipo || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Registrado</span>
              <span className="font-medium text-foreground">
                {v.createdAt
                  ? formatLongDate(v.createdAt)
                  : "—"}
              </span>
            </div>
            {v.notas && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.notas}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Historial de Servicios
          </h2>
          {ordenes.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {ordenes.length === 0 ? (
          <Card className="p-12 text-center border-border bg-card">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium text-foreground">Sin historial de servicios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Este vehículo aún no tiene órdenes registradas
            </p>
            <Link href={`/ordenes/nueva?vehiculoId=${v.id}`}>
              <Button className="mt-4 gap-2 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                Crear Primera Orden
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-border hidden sm:block" />

            <div className="space-y-3">
              {ordenes.map((o, idx) => {
                const config =
                  ESTADO_CONFIG[o.estado] || {
                    label: o.estado,
                    variant: "outline" as const,
                    icon: <ClipboardList className="h-5 w-5" />,
                  };
                const isFirst = idx === 0;
                return (
                  <Card
                    key={o.id}
                    className={`p-4 border-border bg-card hover:border-zinc-350 hover:shadow-sm transition-all ${
                      isFirst ? "ring-1 ring-secondary/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div
                        className={`hidden sm:flex h-10 w-10 rounded-full items-center justify-center text-base shrink-0 mt-0.5 ${
                          isFirst
                            ? "bg-secondary/15 ring-2 ring-secondary/30"
                            : "bg-muted"
                        }`}
                      >
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-sm text-foreground">
                                {o.nroTicket || "S/N"}
                              </span>
                              <Badge
                                variant={config.variant}
                                className="text-[10px] font-semibold"
                              >
                                {config.label}
                              </Badge>
                              {o.prioridad != null && o.prioridad >= 1 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 gap-0.5"
                                  >
                                    <Zap className="h-3 w-3" />
                                    Express
                                  </Badge>
                              )}
                            </div>
                            {o.servicios && (
                              <p className="text-xs text-muted-foreground line-clamp-2 max-w-lg">
                                {o.servicios}
                              </p>
                            )}
                            {o.notas && (
                              <p className="text-[10px] text-muted-foreground/60 italic line-clamp-1 flex items-center gap-1">
                                <FileText className="h-3 w-3 shrink-0" />
                                {o.notas}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground text-sm">
                              {o.total ? formatCurrency(parseFloat(o.total)) : "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              {o.createdAt
                                ? formatDate(o.createdAt)
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
