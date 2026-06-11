import { db } from "@/lib/db";
import { auditoriaLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { History, Shield, User, Ban, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

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

export default async function AuditLogsPage() {
  const logs = await db
    .select()
    .from(auditoriaLogs)
    .orderBy(desc(auditoriaLogs.createdAt))
    .limit(100);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Auditoría de Actividad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de todas las acciones realizadas por superadministradores.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border px-3 py-1.5 rounded-xl">
          <History className="size-3.5" />
          Últimos {logs.length} eventos
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No hay registros de actividad aún.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map((log) => {
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
                      <span>
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
      )}
    </div>
  );
}
