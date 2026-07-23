export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { auditoriaLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { LogsClient } from "./logs-client";


export default async function AuditLogsPage() {
  const logs = await db
    .select()
    .from(auditoriaLogs)
    .orderBy(desc(auditoriaLogs.createdAt))
    .limit(500);

  return (
    <div className="space-y-6 -50 transition-opacity duration-300">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Auditoría de Actividad
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registro de todas las acciones realizadas por superadministradores.
        </p>
      </div>

      <LogsClient initialLogs={logs} />
    </div>
  );
}
