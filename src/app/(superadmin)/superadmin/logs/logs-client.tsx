"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, User, Ban, PlusCircle, Edit, Trash2, Search, X, History, Filter 
} from "lucide-react";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface AuditLog {
  id: string;
  accion: string;
  entidad: string | null;
  descripcion: string;
  usuarioId: string | null;
  usuarioNombre: string;
  metadata: unknown;
  createdAt: Date;
}

interface LogsClientProps {
  initialLogs: AuditLog[];
}

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  crear_empresa: {
    label: "Crear Empresa",
    icon: <PlusCircle className="size-3.5" />,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  },
  editar_empresa: {
    label: "Editar Empresa",
    icon: <Edit className="size-3.5" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/25",
  },
  activar_empresa: {
    label: "Activar Empresa",
    icon: <Shield className="size-3.5" />,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  },
  desactivar_empresa: {
    label: "Desactivar Empresa",
    icon: <Ban className="size-3.5" />,
    color: "bg-rose-500/10 text-rose-500 border-rose-500/25",
  },
  crear_plan: {
    label: "Crear Plan",
    icon: <PlusCircle className="size-3.5" />,
    color: "bg-violet-500/10 text-violet-500 border-violet-500/25",
  },
  editar_plan: {
    label: "Editar Plan",
    icon: <Edit className="size-3.5" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/25",
  },
  eliminar_plan: {
    label: "Eliminar Plan",
    icon: <Trash2 className="size-3.5" />,
    color: "bg-rose-500/10 text-rose-500 border-rose-500/25",
  },
};

function getActionConfig(accion: string) {
  return actionConfig[accion] || {
    label: accion,
    icon: <Shield className="size-3.5" />,
    color: "bg-muted border-border text-muted-foreground",
  };
}

export function LogsClient({ initialLogs }: LogsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("todos");
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.descripcion.toLowerCase().includes(q) ||
        log.usuarioNombre.toLowerCase().includes(q) ||
        (log.entidad || "").toLowerCase().includes(q);

      const matchesAction = actionFilter === "todos" || log.accion === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [initialLogs, searchTerm, actionFilter]);

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedLogs = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, activePage]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(null);
  };

  const handleActionFilterChange = (val: string) => {
    setActionFilter(val);
    setPage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-80 bg-muted/50 border border-border px-3 py-1.5 rounded-xl">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuario o acción..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Buscar logs"
            className="bg-transparent border-0 text-sm text-foreground focus:outline-none w-full focus:ring-0 placeholder-muted-foreground"
          />
          {searchTerm && (
            <button type="button" onClick={() => handleSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3 w-full sm:w-auto items-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-xl text-xs font-semibold">
            <Filter className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Acción:</span>
            <select
              value={actionFilter}
              onChange={(e) => handleActionFilterChange(e.target.value)}
              aria-label="Filtrar por acción"
              className="bg-transparent border-none focus:ring-0 font-bold text-foreground py-0 pl-1 pr-6 cursor-pointer focus:outline-none text-xs"
            >
              <option value="todos">Todos los eventos</option>
              {Object.keys(actionConfig).map((key) => (
                <option key={key} value={key}>
                  {actionConfig[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border px-3 py-1.5 rounded-xl shrink-0">
            <History className="size-3.5" />
            Total: {filteredLogs.length} eventos
          </div>
        </div>
      </div>

      {/* Main List */}
      {paginatedLogs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-border rounded-2xl">
          No hay registros de actividad que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {paginatedLogs.map((log) => {
                const cfg = getActionConfig(log.accion);

                return (
                  <div
                    key={log.id}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-muted/10 transition-colors"
                  >
                    <div className={`p-2 rounded-lg border ${cfg.color} shrink-0`}>
                      {cfg.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${cfg.color} border text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md`}>
                          {cfg.label}
                        </Badge>
                        {log.entidad && (
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {log.entidad}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-medium mt-1">{log.descripcion}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {log.usuarioNombre}
                        </span>
                        <span suppressHydrationWarning>
                          {new Date(log.createdAt).toLocaleString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {Boolean(log.metadata && typeof log.metadata === "object" && Object.keys(log.metadata as Record<string, unknown>).length > 0) && (
                      <details className="shrink-0 group">
                        <summary className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground font-bold uppercase tracking-wider cursor-pointer select-none">
                          Meta
                        </summary>
                        <pre className="text-[9px] text-muted-foreground/60 mt-1 max-w-[200px] truncate">
                          {JSON.stringify(log.metadata, null, 1)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
              <PaginationControls
                activePage={activePage}
                totalPages={totalPages}
                onPageChange={setPage}
                showInfo
                totalItems={filteredLogs.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
