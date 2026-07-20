import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import crypto from "crypto";
import { logAudit } from "@/lib/actions/auditoria";


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
    if (parts.length !== 3) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr);

    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return new NextResponse("Token expirado", { status: 401 });
    }

    const data = `${userId}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Re-verificar el usuario y su rol de superadmin en la base de datos
    const user = await db.query.usuarios.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!user || user.rol !== "superadmin") {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Realizar la consulta de todas las tablas de datos
    const backupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: user.id,
        nombre: `${user.nombre} ${user.apellido || ""}`.trim(),
        email: user.email,
      },
      data: {
        configGlobal: await db.select().from(schema.configGlobal),
        empresas: await db.select().from(schema.empresas),
        planes: await db.select().from(schema.planes),
        sucursales: await db.select().from(schema.sucursales),
        usuarios: await db.select().from(schema.usuarios),
        cuentas: await db.select().from(schema.cuentas),
        verificaciones: await db.select().from(schema.verificaciones),
        clientes: await db.select().from(schema.clientes),
        vehiculos: await db.select().from(schema.vehiculos),
        categoriasServicio: await db.select().from(schema.categoriasServicio),
        servicios: await db.select().from(schema.servicios),
        paquetes: await db.select().from(schema.paquetes),
        paqueteServicios: await db.select().from(schema.paqueteServicios),
        turnosCaja: await db.select().from(schema.turnosCaja),
        ordenes: await db.select().from(schema.ordenes),
        ordenServicios: await db.select().from(schema.ordenServicios),
        pagos: await db.select().from(schema.pagos),
        puntosFidelidad: await db.select().from(schema.puntosFidelidad),
        inventario: await db.select().from(schema.inventario),
        inventarioMovimientos: await db.select().from(schema.inventarioMovimientos),
        notificaciones: await db.select().from(schema.notificaciones),
        auditoriaLogs: await db.select().from(schema.auditoriaLogs),
        cupones: await db.select().from(schema.cupones),
        cuponServicios: await db.select().from(schema.cuponServicios),
        cuponesUsos: await db.select().from(schema.cuponesUsos),
      },
    };

    // Registrar en auditoría la descarga exitosa
    await logAudit({
      usuarioId: user.id,
      usuarioNombre: `${user.nombre} ${user.apellido || ""}`.trim(),
      accion: "backup_descargado",
      descripcion: "Copia de seguridad de la base de datos descargada con éxito",
      entidad: "backups",
      metadata: {
        tablesCount: Object.keys(backupData.data).length,
      },
    });

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split("T")[0];

    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="washmaster-backup-${dateStr}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error en API de Backup:", error);
    return new NextResponse("Error al generar copia de seguridad", { status: 500 });
  }
}
