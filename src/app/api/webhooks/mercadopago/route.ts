import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ordenes, pagos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import crypto from "crypto";
import { crearPreferenciaPago } from "@/lib/payments/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    if (webhookSecret && xSignature) {
      const parts = xSignature.split(",");
      let ts = "";
      let hash = "";
      for (const part of parts) {
        const [key, val] = part.split("=");
        if (key.trim() === "ts") ts = val.trim();
        if (key.trim() === "v1") hash = val.trim();
      }

      if (ts && hash) {
        const urlParams = new URL(req.url).searchParams;
        const dataID = urlParams.get("data.id") || "";
        const manifest = `id:${dataID};request-id:${xRequestId || ""};ts:${ts};`;
        const expectedHash = crypto
          .createHmac("sha256", webhookSecret)
          .update(manifest)
          .digest("hex");

        if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
        }
      }
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || body.type;
    const ordenId = body.data?.id || body.external_reference || body.ordenId;

    if (action === "payment.created" || action === "payment.updated" || ordenId) {
      const targetOrdenId = ordenId || body.id;

      if (targetOrdenId) {
        const [orden] = await db
          .select()
          .from(ordenes)
          .where(eq(ordenes.id, targetOrdenId));

        if (orden && orden.estado !== "cobrado") {
          // 1. Marcar orden como cobrada
          await db
            .update(ordenes)
            .set({
              estado: "cobrado",
              updatedAt: new Date(),
            })
            .where(eq(ordenes.id, targetOrdenId));

          // 2. Registrar el pago en la tabla pagos
          await db.insert(pagos).values({
            ordenId: targetOrdenId,
            monto: orden.total || "0",
            metodo: "yape", // O método de tarjeta configurado
            referencia: `PAY-ONLINE-${Date.now()}`,
          }).catch(() => {});

          revalidateTag("ordenes", { expire: 0 });
          revalidateTag("dashboard", { expire: 0 });
          revalidatePath("/ordenes");
          revalidatePath("/kiosco");
          revalidatePath("/caja");
        }
      }
    }

    return NextResponse.json({ received: true, status: 200 });
  } catch (error) {
    console.error("Error en webhook MercadoPago:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
