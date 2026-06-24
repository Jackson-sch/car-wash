"use client";

import { useMemo } from "react";
import { Search, X, UserCog, MoreVertical, Edit, UserMinus, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
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

interface Empleado {
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
}

interface EmpleadosGridProps {
  empleados: Empleado[];
  currentUserId: string | undefined;
  onEditClick: (empleado: Empleado) => void;
  onToggleStatus: (id: string, active: boolean) => void;
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
}: EmpleadosGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );

  const filtered = useMemo(() => {
    return empleados.filter((e) => {
      const term = (searchQuery || "").toLowerCase();
      return (
        e.nombre.toLowerCase().includes(term) ||
        (e.apellido && e.apellido.toLowerCase().includes(term)) ||
        e.email.toLowerCase().includes(term)
      );
    });
  }, [empleados, searchQuery]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-9 pr-9 bg-card border-zinc-300 hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
          <UserCog className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-foreground">
            {searchQuery
              ? "Sin resultados para tu búsqueda"
              : "No hay empleados registrados"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {searchQuery
              ? "Prueba con otros términos o limpia el filtro"
              : "Los empleados aparecerán aquí cuando se registren"}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((emp) => (
              <Card
                key={emp.id}
                className={`p-6 border-border bg-card hover:border-zinc-350 hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                  !emp.activo ? "opacity-75 dark:opacity-65" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-muted text-foreground font-extrabold flex items-center justify-center text-sm uppercase border border-border shrink-0">
                        {emp.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                          {emp.nombre} {emp.apellido || ""}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span
                            className={`inline-block text-[9px] font-bold rounded px-1.5 py-0.5 border uppercase ${ROL_BADGE[emp.rol] || ""}`}
                          >
                            {emp.rol === "superadmin" ? "Super Admin" : emp.rol}
                          </span>
                          <span
                            className={`inline-block text-[9px] font-bold rounded px-1.5 py-0.5 border uppercase ${
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
                          <button className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="w-44 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/empleados/${emp.id}`)}
                          className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
                        >
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          <span>Ver Detalle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditClick(emp)}
                          className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>Modificar</span>
                        </DropdownMenuItem>
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

                  <div className="text-[10px] text-muted-foreground space-y-0.5 font-medium">
                    <div className="truncate">{emp.email}</div>
                    {emp.telefono && <div>Telf: {emp.telefono}</div>}
                  </div>

                  {emp.rol === "lavador" && (
                    <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs font-bold">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium block">
                          Lavados
                        </span>
                        <span className="text-foreground font-extrabold">
                          {emp.totalLavados} servicios
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium block">
                          Comisión (30%)
                        </span>
                        <span className="text-secondary font-extrabold">
                          {formatCurrency(emp.comisionAcumulada)}
                        </span>
                      </div>
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
