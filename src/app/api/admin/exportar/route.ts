export const dynamic = "force-dynamic";

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import crypto from "crypto";
import { logAudit } from "@/lib/actions/auditoria";
import { eq, inArray } from "drizzle-orm";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Token requerido", { status: 400 });
    }

    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      return new NextResponse("BETTER_AUTH_SECRET no configurado", { status: 500 });
    }

    const parts = token.split(":");
    if (parts.length !== 4) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    const [userId, empresaId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr);

    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return new NextResponse("Token expirado", { status: 401 });
    }

    const data = `${userId}:${empresaId}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Re-verificar el usuario y su rol de admin en la base de datos
    const user = await db.query.usuarios.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user || user.rol !== "admin" || user.empresaId !== empresaId) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // --- CONSULTAS FILTRADAS POR EMPRESA ---
    
    // 1. Empresa
    const empresa = await db.select().from(schema.empresas).where(eq(schema.empresas.id, empresaId));
    const codePlan = empresa[0]?.plan || "free";
    
    // 2. Plan
    const plan = await db.select().from(schema.planes).where(eq(schema.planes.codigo, codePlan));

    // 3. Sucursales
    const sucursales = await db.select().from(schema.sucursales).where(eq(schema.sucursales.empresaId, empresaId));
    const sucursalesIds = sucursales.map((s) => s.id);

    // 4. Usuarios
    const usuarios = await db.select().from(schema.usuarios).where(eq(schema.usuarios.empresaId, empresaId));
    const usuariosIds = usuarios.map((u) => u.id);

    // Si no hay sucursales o usuarios, retornamos arrays vacíos
    const hasSucursales = sucursalesIds.length > 0;
    const hasUsuarios = usuariosIds.length > 0;

    // 5. Cuentas
    const cuentas = hasUsuarios 
      ? await db.select().from(schema.cuentas).where(inArray(schema.cuentas.userId, usuariosIds))
      : [];

    // 6. Clientes
    const clientes = hasSucursales
      ? await db.select().from(schema.clientes).where(inArray(schema.clientes.sucursalId, sucursalesIds))
      : [];
    const clientesIds = clientes.map((c) => c.id);
    const hasClientes = clientesIds.length > 0;

    // 7. Vehiculos
    const vehiculos = hasClientes
      ? await db.select().from(schema.vehiculos).where(inArray(schema.vehiculos.clienteId, clientesIds))
      : [];

    // 8. Categorias de Servicio
    const categoriasServicio = hasSucursales
      ? await db.select().from(schema.categoriasServicio).where(inArray(schema.categoriasServicio.sucursalId, sucursalesIds))
      : [];

    // 9. Servicios
    const servicios = hasSucursales
      ? await db.select().from(schema.servicios).where(inArray(schema.servicios.sucursalId, sucursalesIds))
      : [];
    const _serviciosIds = servicios.map((s) => s.id);

    // 10. Paquetes
    const paquetes = hasSucursales
      ? await db.select().from(schema.paquetes).where(inArray(schema.paquetes.sucursalId, sucursalesIds))
      : [];
    const paquetesIds = paquetes.map((p) => p.id);
    const hasPaquetes = paquetesIds.length > 0;

    // 11. Paquete Servicios
    const paqueteServicios = hasPaquetes
      ? await db.select().from(schema.paqueteServicios).where(inArray(schema.paqueteServicios.paqueteId, paquetesIds))
      : [];

    // 12. Turnos de Caja
    const turnosCaja = hasSucursales
      ? await db.select().from(schema.turnosCaja).where(inArray(schema.turnosCaja.sucursalId, sucursalesIds))
      : [];

    // 13. Ordenes
    const ordenes = hasSucursales
      ? await db.select().from(schema.ordenes).where(inArray(schema.ordenes.sucursalId, sucursalesIds))
      : [];
    const ordenesIds = ordenes.map((o) => o.id);
    const hasOrdenes = ordenesIds.length > 0;

    // 14. Orden Servicios
    const ordenServicios = hasOrdenes
      ? await db.select().from(schema.ordenServicios).where(inArray(schema.ordenServicios.ordenId, ordenesIds))
      : [];

    // 15. Pagos
    const pagos = hasOrdenes
      ? await db.select().from(schema.pagos).where(inArray(schema.pagos.ordenId, ordenesIds))
      : [];

    // 16. Puntos de Fidelidad
    const puntosFidelidad = hasClientes
      ? await db.select().from(schema.puntosFidelidad).where(inArray(schema.puntosFidelidad.clienteId, clientesIds))
      : [];

    // 17. Inventario
    const inventario = hasSucursales
      ? await db.select().from(schema.inventario).where(inArray(schema.inventario.sucursalId, sucursalesIds))
      : [];
    const inventarioIds = inventario.map((i) => i.id);
    const hasInventario = inventarioIds.length > 0;

    // 18. Inventario Movimientos
    const inventarioMovimientos = hasInventario
      ? await db.select().from(schema.inventarioMovimientos).where(inArray(schema.inventarioMovimientos.itemId, inventarioIds))
      : [];

    // 19. Notificaciones
    const notificaciones = hasUsuarios
      ? await db.select().from(schema.notificaciones).where(inArray(schema.notificaciones.usuarioId, usuariosIds))
      : [];

    // 20. Auditoria Logs
    const auditoriaLogs = hasUsuarios
      ? await db.select().from(schema.auditoriaLogs).where(inArray(schema.auditoriaLogs.usuarioId, usuariosIds))
      : [];

    // 21. Cupones
    const cupones = hasSucursales
      ? await db.select().from(schema.cupones).where(inArray(schema.cupones.sucursalId, sucursalesIds))
      : [];
    const cuponesIds = cupones.map((cp) => cp.id);
    const hasCupones = cuponesIds.length > 0;

    // 22. Cupon Servicios
    const cuponServicios = hasCupones
      ? await db.select().from(schema.cuponServicios).where(inArray(schema.cuponServicios.cuponId, cuponesIds))
      : [];

    // 23. Cupones Usos
    const cuponesUsos = hasCupones
      ? await db.select().from(schema.cuponesUsos).where(inArray(schema.cuponesUsos.cuponId, cuponesIds))
      : [];

    const backupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: user.id,
        nombre: `${user.nombre} ${user.apellido || ""}`.trim(),
        email: user.email,
        empresaId: user.empresaId,
      },
      data: {
        empresa,
        plan,
        sucursales,
        usuarios,
        cuentas,
        clientes,
        vehiculos,
        categoriasServicio,
        servicios,
        paquetes,
        paqueteServicios,
        turnosCaja,
        ordenes,
        ordenServicios,
        pagos,
        puntosFidelidad,
        inventario,
        inventarioMovimientos,
        notificaciones,
        auditoriaLogs,
        cupones,
        cuponServicios,
        cuponesUsos,
      },
    };

    // Registrar en auditoría la descarga de la empresa
    await logAudit({
      usuarioId: user.id,
      usuarioNombre: `${user.nombre} ${user.apellido || ""}`.trim(),
      accion: "backup_empresa_descargado",
      descripcion: "Copia de seguridad local de la empresa descargada con éxito",
      entidad: "backups",
      metadata: {
        tablesCount: Object.keys(backupData.data).length,
      },
    });

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split("T")[0];
    const empresaSlug = (empresa[0]?.nombre || "empresa").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="washmaster-${empresaSlug}-backup-${dateStr}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error en API de Exportación de Empresa:", error);
    return new NextResponse("Error al generar copia de seguridad", { status: 500 });
  }
}
