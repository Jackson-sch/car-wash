"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Tag,
  Gift,
  TrendingUp,
  Lightbulb,
  Plus,
  Search,
  X,
  Copy,
  Check,
  Pencil,
  Percent,
  Coins,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/formats";
import { toggleCupon } from "@/lib/actions/cupones";
import { toast } from "sonner";
import { CuponForm } from "./components/CuponForm";

interface ServicioType {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoriaNombre: string | null;
}

interface CuponBasic {
  id: string;
  codigo: string;
  activo: boolean;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  fechaFin: Date | null;
  usos?: unknown[];
  servicios?: { servicioId?: string | null; servicio?: { id: string } | null }[];
}

export function CuponesClient({
  initialCupones,
  servicios,
}: {
  initialCupones: CuponBasic[];
  servicios: ServicioType[];
}) {
  const [cupones, setCupones] = useState<CuponBasic[]>(initialCupones);
  const [editingCupon, setEditingCupon] = useState<CuponBasic | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "activos" | "inactivos" | "porcentaje" | "fijo">("todos");
  const [isPending, startTransition] = useTransition();

  // Metrics
  const totalCupones = cupones.length;
  const activos = cupones.filter((c) => c.activo).length;
  const totalUsos = useMemo(
    () => cupones.reduce((acc, c) => acc + (c.usos?.length || 0), 0),
    [cupones]
  );

  // Filtrado
  const filteredCupones = useMemo(() => {
    return cupones.filter((c) => {
      const matchSearch =
        c.codigo.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchSearch) return false;

      if (filterType === "activos") return c.activo;
      if (filterType === "inactivos") return !c.activo;
      if (filterType === "porcentaje") return c.tipoDescuento === "porcentaje";
      if (filterType === "fijo") return c.tipoDescuento === "fijo";
      return true;
    });
  }, [cupones, searchQuery, filterType]);

  const handleEdit = (cupon: CuponBasic) => {
    setEditingCupon(cupon);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCupon(null);
    setIsCreating(false);
  };

  const handleToggleStatus = async (id: string, activoActual: boolean) => {
    startTransition(async () => {
      const res = await toggleCupon(id, !activoActual);
      if (res.success) {
        setCupones((prev) =>
          prev.map((c) => (c.id === id ? { ...c, activo: !activoActual } : c))
        );
        toast.success(activoActual ? "Cupón desactivado" : "Cupón activado");
      } else {
        toast.error(res.error || "Error al cambiar estado");
      }
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground">
      {/* ── Header Principal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Tag className="size-7 text-secondary" />
            Cupones & Promociones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea códigos promocionales con descuento porcentual o fijo y fideliza a tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="h-10 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
          >
            <Lightbulb className="size-4 text-amber-500" />
            <span className="hidden sm:inline">Guía</span>
            {showGuide ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>

          <Button
            type="button"
            onClick={() => {
              setEditingCupon(null);
              setIsCreating(!isCreating);
            }}
            className="h-10 px-4 text-xs sm:text-sm font-bold gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
          >
            {isCreating ? (
              <>
                <X className="size-4" />
                Cerrar Formulario
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Nuevo Cupón
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Guía Desplegable ── */}
      {showGuide && (
        <Card className="p-4 sm:p-5 border-amber-500/20 bg-amber-500/5 text-xs space-y-2 rounded-2xl animate-in fade-in-0 slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="size-4" />
            Reglas de Cupones y Promociones
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground leading-relaxed">
            <div className="p-2.5 rounded-xl bg-background/60 border border-border/60">
              <span className="font-bold text-foreground block mb-0.5">1. Tipo de Descuento</span>
              Porcentaje (ej. 15% de rebaja) o Monto Fijo (ej. S/ 5.00 de descuento en el total).
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 border border-border/60">
              <span className="font-bold text-foreground block mb-0.5">2. Compra Mínima</span>
              Exige un gasto piso para activar la promoción y asegurar rentabilidad.
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 border border-border/60">
              <span className="font-bold text-foreground block mb-0.5">3. Límites de Canje</span>
              Establece cupos máximos de uso global o por cliente para no exceder presupuestos.
            </div>
          </div>
        </Card>
      )}

      {/* ── Bento KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cupones */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Cupones
            </span>
            <span className="text-3xl font-black text-foreground mt-0.5 block">
              {totalCupones}
            </span>
            <span className="text-[10px] text-muted-foreground">Códigos en catálogo</span>
          </div>
          <div className="size-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Tag className="size-5" />
          </div>
        </Card>

        {/* Cupones Activos */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Campañas Activas
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {activos}
            </span>
            <span className="text-[10px] text-muted-foreground">Disponibles para cobro</span>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Gift className="size-5" />
          </div>
        </Card>

        {/* Canjes Registrados */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Canjes Registrados
            </span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
              {totalUsos}
            </span>
            <span className="text-[10px] text-muted-foreground">Descuentos otorgados</span>
          </div>
          <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <TrendingUp className="size-5" />
          </div>
        </Card>
      </div>

      {/* ── Formulario de Creación / Edición (Desplegable) ── */}
      {isCreating && (
        <Card className="p-6 border-secondary/30 bg-card rounded-3xl shadow-xl space-y-4 animate-in fade-in-0 zoom-in-98">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                <Tag className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {editingCupon ? `Editar Cupón: ${editingCupon.codigo}` : "Crear Nuevo Código Promocional"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define el valor del descuento, servicios aplicables y condiciones de validez.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelEdit}
              className="size-8 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          <CuponForm
            servicios={servicios}
            editingCupon={editingCupon}
            onCancelEdit={handleCancelEdit}
          />
        </Card>
      )}

      {/* ── Toolbar de Búsqueda y Filtros ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs rounded-xl bg-card border-border text-foreground font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por Tipo */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card/70 border border-border rounded-xl shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType("todos")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "todos"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({totalCupones})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("activos")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "activos"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Activos ({activos})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("porcentaje")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "porcentaje"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            % Descuento
          </button>
          <button
            type="button"
            onClick={() => setFilterType("fijo")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "fijo"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            S/ Fijo
          </button>
        </div>
      </div>

      {/* ── Cuadrícula de Vouchers Promocionales ── */}
      {filteredCupones.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Tag className="size-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {searchQuery ? "Sin resultados para tu búsqueda" : "No hay cupones registrados"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchQuery
              ? "Prueba buscando con otro término o limpia los filtros."
              : "Genera tu primer código promocional para atraer y premiar a tus clientes."}
          </p>
          <Button
            type="button"
            onClick={() => {
              setEditingCupon(null);
              setIsCreating(true);
            }}
            className="mt-2 text-xs font-bold h-9 rounded-xl bg-secondary text-secondary-foreground cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" />
            Crear Primer Cupón
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCupones.map((c) => (
            <VoucherCard
              key={c.id}
              cupon={c}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de Cupón Estilo Voucher ─────────────────────────────
function VoucherCard({
  cupon: c,
  onEdit,
  onToggleStatus,
  isPending,
}: {
  cupon: CuponBasic;
  onEdit: (cupon: CuponBasic) => void;
  onToggleStatus: (id: string, activoActual: boolean) => void;
  isPending: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(c.codigo);
    setCopied(true);
    toast.success(`Código ${c.codigo} copiado al portapapeles`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercentage = c.tipoDescuento === "porcentaje";
  const numUsos = c.usos?.length || 0;

  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between shadow-xs ${
        c.activo
          ? "bg-card hover:border-secondary/50 hover:shadow-md"
          : "bg-muted/30 border-dashed border-border/70 opacity-75"
      }`}
    >
      {/* Header del Voucher: Código y Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {/* Badge del Código con Botón Copiar */}
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-xl px-2.5 py-1.5">
            <span className="font-mono font-black text-xs sm:text-sm tracking-widest text-foreground">
              {c.codigo}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="size-6 rounded-md hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          {/* Switch Activo / Inactivo */}
          <div className="flex items-center gap-2">
            <Switch
              checked={c.activo}
              onCheckedChange={() => onToggleStatus(c.id, c.activo)}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Descuento Destacado */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isPercentage ? (
                <>
                  <span>{c.valorDescuento}%</span>
                  <span className="text-xs uppercase font-extrabold text-secondary px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                    Descuento
                  </span>
                </>
              ) : (
                <>
                  <span>{formatCurrency(c.valorDescuento)}</span>
                  <span className="text-xs uppercase font-extrabold text-secondary px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                    Ahorro Fijo
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {c.servicios && c.servicios.length > 0
                ? `Válido para ${c.servicios.length} ${c.servicios.length === 1 ? "servicio" : "servicios"}`
                : "Válido para todos los servicios de lavado"}
            </p>
          </div>
        </div>
      </div>

      {/* Línea divisoria estilo ticket */}
      <div className="relative my-4">
        <div className="border-t border-dashed border-border/80" />
        <div className="absolute -left-7 -top-2 size-4 rounded-full bg-background border-r border-border" />
        <div className="absolute -right-7 -top-2 size-4 rounded-full bg-background border-l border-border" />
      </div>

      {/* Métricas y Acciones del Footer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <TrendingUp className="size-3.5 text-secondary" />
            <span>{numUsos} canjes</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <Calendar className="size-3" />
            <span>
              {c.fechaFin ? `Hasta ${formatDate(c.fechaFin)}` : "Sin caducidad"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/50">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold ${
              c.activo
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "border-border text-muted-foreground bg-muted/40"
            }`}
          >
            {c.activo ? "Campaña Activa" : "Pausado"}
          </Badge>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(c)}
            className="h-8 px-2.5 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
          >
            <Pencil className="size-3.5" />
            Editar
          </Button>
        </div>
      </div>
    </Card>
  );
}
