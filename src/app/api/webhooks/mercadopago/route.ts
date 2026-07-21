import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ordenes, pagos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
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
