"use client";

import { useMemo, useTransition } from "react";
import { formatDate, formatCurrency } from "@/lib/formats";
import { Search, X, Users, TrendingUp, Tag, Pencil } from "lucide-react";
import { toast } from "sonner";
import { toggleCupon } from "@/lib/actions/cupones";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface CuponesSidebarProps {
  cupones: any[];
  onEdit: (cupon: any) => void;
}

export function CuponesSidebar({ cupones, onEdit }: CuponesSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const filtered = useMemo(() => {
    const term = (searchQuery || "").toLowerCase();
    if (!term) return cupones;
    return cupones.filter(
      (c: any) =>
        c.codigo.toLowerCase().includes(term) ||
        (c.tipoDescuento || "").toLowerCase().includes(term)
    );
  }, [cupones, searchQuery]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleToggleStatus = async (id: string, activoActual: boolean) => {
    startTransition(async () => {
      const res = await toggleCupon(id, !activoActual);
      if (res.success) {
        toast.success(activoActual ? "Cupón desactivado" : "Cupón activado");
      } else {
        toast.error(res.error || "Error al cambiar estado");
      }
    });
  };

  return (
    <Card className="shadow-sm sticky top-4">
      <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Cupones</CardTitle>
        <span className="text-xs text-muted-foreground">{filtered.length} cupones</span>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-8 pr-8 h-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {paginatedData.length === 0 ? (
          <div className="py-8 text-center">
            <Tag className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              {searchQuery ? "Sin resultados" : "No hay cupones creados"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? "Prueba con otro código"
                : "Usa el formulario para crear tu primer cupón"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedData.map((cupon: any) => (
              <div
                key={cupon.id}
                className={`p-3 border rounded-lg transition-colors ${
                  cupon.activo ? "bg-card hover:border-primary/50" : "bg-muted/50 opacity-75"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold font-mono text-sm">{cupon.codigo}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={cupon.activo ? "default" : "secondary"} className="text-[10px] uppercase">
                      {cupon.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(cupon)}
                      title="Editar cupón"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Switch
                      checked={cupon.activo}
                      onCheckedChange={() => handleToggleStatus(cupon.id, cupon.activo)}
                      disabled={isPending}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {cupon.tipoDescuento === "porcentaje" ? `${cupon.valorDescuento}% off` : `${formatCurrency(cupon.valorDescuento)} off`}
                  {cupon.servicios?.length > 0 ? ` en ${cupon.servicios.length} servicios` : " en todo"}
                </p>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {cupon.usos?.length || 0} Usos
                  </span>
                  <span>
                    {cupon.fechaFin ? `Hasta ${formatDate(cupon.fechaFin)}` : "Sin caducidad"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        {/* Impact Card */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Impacto General</h4>
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
            <p className="text-3xl font-bold text-foreground">
              {cupones.reduce((acc: number, c: any) => acc + (c.usos?.length || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Canjes Totales de Cupones</p>
            <div className="mt-3 flex items-center text-[11px] text-green-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              Rendimiento de Marketing
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
