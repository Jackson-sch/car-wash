"use client";

import { useMemo } from "react";
import {
  Search,
  X,
  UserCog,
  MoreVertical,
  Edit,
  UserMinus,
  UserCheck,
  Clock,
  Coins,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatCurrency } from "@/lib/formats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: "superadmin" | "admin" | "supervisor" | "cajero" | "lavador";
  activo: boolean | null;
  totalLavados: number;
  montoLavado: number;
  comisionAcumulada: number;
  comisionHistorica?: number;
  ordenesPendientesLiquidar?: number;
  tiempoPromedioMin?: number;
  sucursalNombre?: string | null;
}

interface EmpleadosGridProps {
  empleados: Empleado[];
  currentUserId: string | undefined;
  onEditClick: (empleado: Empleado) => void;
  onToggleStatus: (id: string, active: boolean) => void;
  onLiquidarClick?: (empleado: Empleado) => void;
}

const ROL_BADGE: Record<string, string> = {
  superadmin:
    "border-indigo-200 text-indigo-800 bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-950/30",
  admin:
    "border-rose-200 text-rose-800 bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:bg-rose-950/30",
  supervisor:
    "border-purple-200 text-purple-800 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/30",
  cajero:
    "border-blue-200 text-blue-800 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/30",
  lavador:
    "border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/30",
};

export function EmpleadosGrid({
  empleados,
  currentUserId,
  onEditClick,
  onToggleStatus,
  onLiquidarClick,
}: EmpleadosGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [rolFilter, setRolFilter] = useQueryState("rol", {
    defaultValue: "all",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const counts = useMemo(() => {
    return {
      all: empleados.length,
      lavador: empleados.filter((e) => e.rol === "lavador").length,
      cajero: empleados.filter((e) => e.rol === "cajero").length,
      gestion: empleados.filter(
        (e) => e.rol === "admin" || e.rol === "supervisor" || e.rol === "superadmin"
      ).length,
    };
  }, [empleados]);

  const filtered = useMemo(() => {
    const term = (searchQuery || "").toLowerCase();
    return empleados.filter((e) => {
      const matchesSearch =
        !term ||
        e.nombre.toLowerCase().includes(term) ||
        (e.apellido && e.apellido.toLowerCase().includes(term)) ||
        e.email.toLowerCase().includes(term);

      const matchesRol =
        rolFilter === "all" ||
        (rolFilter === "lavador" && e.rol === "lavador") ||
        (rolFilter === "cajero" && e.rol === "cajero") ||
        (rolFilter === "gestion" &&
          (e.rol === "admin" || e.rol === "supervisor" || e.rol === "superadmin"));

      return matchesSearch && matchesRol;
    });
  }, [empleados, searchQuery, rolFilter]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div suppressHydrationWarning className="space-y-5">
      {/* Search & Role Filter Bar */}
      <div
        suppressHydrationWarning
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div suppressHydrationWarning className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-9 pr-9 bg-card/60 border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(null);
              }}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-card/60 border border-border p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: "all", label: `Todos (${counts.all})` },
            { id: "lavador", label: `Lavadores (${counts.lavador})` },
            { id: "cajero", label: `Cajeros (${counts.cajero})` },
            { id: "gestion", label: `Supervisión / Admin (${counts.gestion})` },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setRolFilter(pill.id);
                setPage(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                rolFilter === pill.id
                  ? "bg-secondary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card
          suppressHydrationWarning
          className="p-12 border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto"
        >
          <UserCog className="h-10 w-10 text-muted-foreground/60" />
          <p className="font-medium text-foreground">
            {searchQuery || rolFilter !== "all"
              ? "Sin resultados para el filtro aplicado"
              : "No hay empleados registrados"}
          </p>
          <p className="text-xs text-muted-foreground">
            {searchQuery || rolFilter !== "all"
              ? "Prueba con otros términos o selecciona Todos los roles"
              : "Los empleados aparecerán aquí cuando se registren"}
          </p>
        </Card>
      ) : (
        <>
          <div
            suppressHydrationWarning
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {paginatedData.map((emp) => (
              <Card
                suppressHydrationWarning
                key={emp.id}
                className={`p-5 border-border bg-card hover:border-secondary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between rounded-2xl ${
                  !emp.activo ? "opacity-75 dark:opacity-65 bg-muted/20 border-dashed" : ""
                }`}
              >
                <div suppressHydrationWarning className="space-y-3.5">
                  <div
                    suppressHydrationWarning
                    className="flex items-start justify-between gap-2"
                  >
                    <div
                      suppressHydrationWarning
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div
                        suppressHydrationWarning
                        className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary font-extrabold flex items-center justify-center text-sm uppercase border border-secondary/20 shrink-0"
                      >
                        {emp.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => router.push(`/empleados/${emp.id}`)}
                          className="text-sm font-extrabold text-foreground hover:text-secondary leading-tight truncate block text-left cursor-pointer transition-colors"
                        >
                          {emp.nombre} {emp.apellido || ""}
                        </button>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span
                            className={`inline-block text-[10px] font-extrabold rounded px-2 py-0.5 border uppercase ${
                              ROL_BADGE[emp.rol] || ""
                            }`}
                          >
                            {emp.rol === "superadmin" ? "Super Admin" : emp.rol}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-extrabold rounded px-2 py-0.5 border uppercase ${
                              emp.activo
                                ? "border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-300 dark:bg-emerald-950/20"
                                : "border-zinc-300 text-zinc-500 bg-zinc-50 dark:border-zinc-700/40 dark:text-zinc-400 dark:bg-zinc-800/20"
                            }`}
                          >
                            {emp.activo ? "Activo" : "De Baja"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            aria-label="Acciones del empleado"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="w-44 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 fade-in-50 zoom-in-95"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/empleados/${emp.id}`)}
                          className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span>Ficha de Rendimiento</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditClick(emp)}
                          className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>Modificar Datos</span>
                        </DropdownMenuItem>
                        {emp.rol === "lavador" &&
                          emp.comisionAcumulada > 0 &&
                          onLiquidarClick && (
                            <DropdownMenuItem
                              onClick={() => onLiquidarClick(emp)}
                              className="focus:bg-emerald-500/10 focus:text-emerald-600 cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                            >
                              <Coins className="h-4 w-4" />
                              <span>Liquidar Comisión</span>
                            </DropdownMenuItem>
                          )}
                        {emp.activo ? (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(emp.id, false)}
                            disabled={emp.id === currentUserId || emp.rol === "superadmin"}
                            className="focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-450 cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserMinus className="h-4 w-4 text-rose-500/70" />
                            <span>Dar de baja</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(emp.id, true)}
                            disabled={emp.rol === "superadmin"}
                            className="focus:bg-emerald-500/10 focus:text-emerald-600 cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserCheck className="h-4 w-4 text-emerald-500/70" />
                            <span>Dar de alta</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-0.5 font-medium">
                    <div className="truncate">{emp.email}</div>
                    <div className="flex items-center justify-between gap-2">
                      {emp.telefono ? <span>Telf: {emp.telefono}</span> : <span />}
                      {emp.sucursalNombre && (
                        <span className="text-secondary font-bold text-[10px]">
                          {emp.sucursalNombre}
                        </span>
                      )}
                    </div>
                  </div>

                  {emp.rol === "lavador" && (
                    <div className="pt-3 border-t border-border/80 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-muted/30 border border-border/50">
                          <span className="text-[10px] text-muted-foreground font-semibold block">
                            Lavados Totales
                          </span>
                          <span className="text-foreground font-black font-mono text-sm">
                            {emp.totalLavados}
                          </span>
                          {emp.tiempoPromedioMin !== undefined && (
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mt-0.5">
                              <Clock className="size-2.5" />~{emp.tiempoPromedioMin} min/auto
                            </span>
                          )}
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            Por Liquidar (30%)
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-sm">
                            {formatCurrency(emp.comisionAcumulada)}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {emp.ordenesPendientesLiquidar ?? emp.totalLavados} órd. pendientes
                          </span>
                        </div>
                      </div>

                      {emp.comisionAcumulada > 0 && onLiquidarClick && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onLiquidarClick(emp)}
                          className="w-full h-8 text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                        >
                          <Coins className="size-3.5" />
                          Liquidar Comisión ({formatCurrency(emp.comisionAcumulada)})
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationControls
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={setPage}
              showInfo
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}
