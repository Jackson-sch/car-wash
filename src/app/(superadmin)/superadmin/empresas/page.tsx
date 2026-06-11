import { db } from "@/lib/db";
import { empresas } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { EmpresasClientList } from "./empresas-client";

export const dynamic = "force-dynamic";

async function getEmpresasFromDB() {
  const rows = await db.execute(
    sql`
      SELECT
        e.id,
        e.nombre,
        e.plan,
        e.activo,
        e.created_at AS "createdAt",
        (
          SELECT COALESCE(COUNT(*), 0)::int
          FROM sucursales s
          WHERE s.empresa_id = e.id
        ) AS "totalSucursales",
        (
          SELECT COALESCE(COUNT(*), 0)::int
          FROM usuarios u
          WHERE u.empresa_id = e.id
        ) AS "totalUsuarios"
      FROM empresas e
      ORDER BY e.nombre
    `
  );

  return rows as unknown as {
    id: string;
    nombre: string;
    plan: string;
    activo: boolean;
    createdAt: Date;
    totalSucursales: number;
    totalUsuarios: number;
  }[];
}

export default async function SuperAdminEmpresasPage() {
  const empresasData = await getEmpresasFromDB();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Gestión de Empresas (Tenants)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra, edita y administra los diferentes car-washes que utilizan la plataforma.
        </p>
      </div>

      <EmpresasClientList initialEmpresas={empresasData} />
    </div>
  );
}
