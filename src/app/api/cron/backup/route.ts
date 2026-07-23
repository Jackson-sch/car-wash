export const dynamic = "force-dynamic";

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";


const ALGORITHM = "aes-256-cbc";

// Función para cifrar la copia de seguridad
function encryptBackup(text: string, secret: string) {
  // Aseguramos una clave de 32 bytes usando scrypt
  const key = crypto.scryptSync(secret, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Autorización: Verificación del CRON_SECRET de Vercel o token de query
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.BACKUP_CRON_TOKEN || "local-dev-backup-key";
    
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get("token");

    const isAuthorized = 
      (authHeader === `Bearer ${cronSecret}`) || 
      (queryToken === cronSecret);

    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      return new NextResponse("BETTER_AUTH_SECRET no configurado", { status: 500 });
    }

    // 2. Recopilar la información completa de la base de datos
    const backupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      triggeredBy: "cron-job",
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

    const jsonString = JSON.stringify(backupData);
    
    // 3. Cifrar la información
    const encryptedData = encryptBackup(jsonString, secret);
    const encryptedString = JSON.stringify(encryptedData);

    // 4. Subir a Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse("Credenciales de Supabase no configuradas", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const bucketName = "backups";

    // Crear el bucket si no existe (método privado)
    await supabase.storage.createBucket(bucketName, {
      public: false,
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `washmaster-backup-${dateStr}.enc.json`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, Buffer.from(encryptedString), {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error al subir copia de seguridad a Supabase Storage:", uploadError);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Copia de seguridad cifrada y almacenada correctamente",
      path: uploadData.path,
      fileName,
    });
  } catch (error: unknown) {
    console.error("Error en API de Cron Backup:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error interno al generar backup" },
      { status: 500 }
    );
  }
}
