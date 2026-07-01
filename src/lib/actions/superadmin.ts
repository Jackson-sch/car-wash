"use server";

import { db } from "@/lib/db";
import { empresas, sucursales, usuarios, cuentas, planes, sesiones, pagos, ordenes } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { getErrorMessage } from "./action-utils";
import { logAudit } from "./auditoria";

async function verifySuperAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.rol !== "superadmin") {
    throw new Error("No autorizado. Acceso restringido a Super Administradores.");
  }
  return session;
}

// Obtener métricas globales del sistema
export async function getSuperAdminMetrics() {
  try {
    await verifySuperAdminSession();

    const [companiesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(empresas);

    const [branchesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sucursales);

    const [usersCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usuarios);

    const planStats = await db
      .select({
        plan: empresas.plan,
        count: sql<number>`count(*)::int`,
      })
      .from(empresas)
      .groupBy(empresas.plan);

    // Ingresos mensuales (últimos 6 meses) cruzando pagos → ordenes → sucursales → empresas
    const monthlyRevenue = await db.execute(
      sql`
        SELECT
          to_char(p.created_at, 'YYYY-MM') AS "mes",
          COALESCE(SUM(p.monto::numeric), 0) AS "total"
        FROM ${pagos} p
        JOIN ${ordenes} o ON o.id = p.orden_id
        JOIN ${sucursales} s ON s.id = o.sucursal_id
        WHERE p.created_at >= date_trunc('month', now()) - interval '5 months'
        GROUP BY "mes"
        ORDER BY "mes"
      `
    ) as unknown as { mes: string; total: string }[];

    // Crecimiento de empresas por mes (últimos 6 meses)
    const empresaGrowth = await db.execute(
      sql`
        SELECT
          to_char(created_at, 'YYYY-MM') AS "mes",
          COUNT(*)::int AS "total"
        FROM ${empresas}
        WHERE created_at >= date_trunc('month', now()) - interval '5 months'
        GROUP BY "mes"
        ORDER BY "mes"
      `
    ) as unknown as { mes: string; total: number }[];

    return {
      success: true,
      data: {
        totalEmpresas: companiesCount?.count || 0,
        totalSucursales: branchesCount?.count || 0,
        totalUsuarios: usersCount?.count || 0,
        planes: planStats || [],
        monthlyRevenue: monthlyRevenue || [],
        empresaGrowth: empresaGrowth || [],
      },
    };
  } catch (error) {
    console.error("Error fetching super admin metrics:", error);
    return { success: false, error: getErrorMessage(error, "Error al cargar métricas") };
  }
}

// Obtener todas las empresas con sus métricas
export async function getEmpresas() {
  try {
    await verifySuperAdminSession();

    return await db
      .select({
        id: empresas.id,
        nombre: empresas.nombre,
        plan: empresas.plan,
        activo: empresas.activo,
        createdAt: empresas.createdAt,
        totalSucursales: sql<number>`(
          SELECT COALESCE(COUNT(*), 0)::int
          FROM ${sucursales}
          WHERE ${sucursales.empresaId} = ${empresas.id}
        )`,
        totalUsuarios: sql<number>`(
          SELECT COALESCE(COUNT(*), 0)::int
          FROM ${usuarios}
          WHERE ${usuarios.empresaId} = ${empresas.id}
        )`,
      })
      .from(empresas)
      .orderBy(empresas.nombre);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

// Crear una nueva empresa (Tenant) con su sucursal y administrador principal
export async function createEmpresa(data: {
  nombreEmpresa: string;
  plan: "free" | "pro" | "enterprise";
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminTelefono?: string;
}) {
  try {
    await verifySuperAdminSession();

    // 1. Validar si el email ya existe
    const [existingUser] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, data.adminEmail.trim().toLowerCase()))
      .limit(1);

    if (existingUser) {
      return { success: false, error: "El correo electrónico del administrador ya está registrado." };
    }

    // 2. Ejecutar inserciones en transacción
    const session = await verifySuperAdminSession();

    const result = await db.transaction(async (tx) => {
      const [newEmpresa] = await tx
        .insert(empresas)
        .values({
          nombre: data.nombreEmpresa.trim(),
          plan: data.plan,
          activo: true,
        })
        .returning();

      const [newSucursal] = await tx
        .insert(sucursales)
        .values({
          empresaId: newEmpresa.id,
          nombre: `Sucursal Principal - ${newEmpresa.nombre}`,
          direccion: "",
          config: { igv: 18, moneda: "PEN" },
          activa: true,
        })
        .returning();

      const adminId = `usr_${randomUUID().replace(/-/g, "")}`;
      const [newAdmin] = await tx
        .insert(usuarios)
        .values({
          id: adminId,
          empresaId: newEmpresa.id,
          sucursalId: newSucursal.id,
          nombre: data.adminNombre.trim(),
          apellido: data.adminApellido.trim(),
          email: data.adminEmail.trim().toLowerCase(),
          emailVerified: true,
          rol: "admin",
          telefono: data.adminTelefono || null,
          activo: true,
        })
        .returning();

      const defaultPassword = "WashMaster2026!";
      const hashedPassword = await hashPassword(defaultPassword);

      await tx.insert(cuentas).values({
        id: `acc_${adminId}`,
        accountId: adminId,
        providerId: "credential",
        userId: adminId,
        password: hashedPassword,
      });

      return {
        empresa: newEmpresa,
        admin: newAdmin,
        passwordDefault: defaultPassword,
      };
    });

    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "crear_empresa",
      descripcion: `Creó la empresa "${result.empresa.nombre}" con plan ${result.empresa.plan}`,
      entidad: "empresa",
      entidadId: result.empresa.id,
      metadata: { plan: result.empresa.plan, adminEmail: data.adminEmail },
    });

    revalidatePath("/superadmin/empresas");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear la empresa") };
  }
}

// Activar/Desactivar empresa
export async function toggleEmpresaStatus(empresaId: string, activo: boolean) {
  try {
    const session = await verifySuperAdminSession();

    await db
      .update(empresas)
      .set({ activo, updatedAt: new Date() })
      .where(eq(empresas.id, empresaId));

    await db
      .update(sucursales)
      .set({ activa: activo, updatedAt: new Date() })
      .where(eq(sucursales.empresaId, empresaId));

    await db
      .update(usuarios)
      .set({ activo, updatedAt: new Date() })
      .where(eq(usuarios.empresaId, empresaId));

    if (!activo) {
      const userRows = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .where(eq(usuarios.empresaId, empresaId));

      if (userRows.length > 0) {
        const userIds = userRows.map((u) => u.id);
        await db.delete(sesiones).where(inArray(sesiones.userId, userIds));
      }
    }

    const estado = activo ? "activó" : "desactivó";
    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: activo ? "activar_empresa" : "desactivar_empresa",
      descripcion: `${estado} la empresa`,
      entidad: "empresa",
      entidadId: empresaId,
    });

    revalidatePath("/superadmin/empresas");
    return { success: true };
  } catch (error) {
    console.error("Error toggling company status:", error);
    return { success: false, error: getErrorMessage(error, "Error al cambiar estado") };
  }
}

// Obtener empresa por ID con sucursales y usuarios
export async function getEmpresaById(empresaId: string) {
  try {
    await verifySuperAdminSession();

    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) return { success: false, error: "Empresa no encontrada" };

    const branches = await db
      .select()
      .from(sucursales)
      .where(eq(sucursales.empresaId, empresaId))
      .orderBy(sucursales.nombre);

    const users = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        email: usuarios.email,
        rol: usuarios.rol,
        activo: usuarios.activo,
        sucursalId: usuarios.sucursalId,
        createdAt: usuarios.createdAt,
      })
      .from(usuarios)
      .where(eq(usuarios.empresaId, empresaId))
      .orderBy(usuarios.nombre);

    return { success: true, data: { empresa, branches, users } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al obtener empresa") };
  }
}

// Actualizar datos de una empresa
export async function updateEmpresa(
  empresaId: string,
  data: { nombre?: string; plan?: string; activo?: boolean }
) {
  try {
    const session = await verifySuperAdminSession();

    await db
      .update(empresas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(empresas.id, empresaId));

    const cambios = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "editar_empresa",
      descripcion: `Editó la empresa (${cambios})`,
      entidad: "empresa",
      entidadId: empresaId,
      metadata: data as Record<string, unknown>,
    });

    revalidatePath("/superadmin/empresas");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al actualizar empresa") };
  }
}

// Obtener planes activos para el selector
export async function getPlanesActivos() {
  try {
    return await db
      .select({ codigo: planes.codigo, nombre: planes.nombre, precio: planes.precio })
      .from(planes)
      .where(eq(planes.activo, true))
      .orderBy(planes.precio);
  } catch (error) {
    console.error("Error fetching planes:", error);
    return [];
  }
}

export type EmpresaDetalle = Awaited<ReturnType<typeof getEmpresaById>>["data"];
