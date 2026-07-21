// WashMaster Pro - Integración de Cobros Online (MercadoPago / Yape / Tarjetas)

export interface CrearPreferenciaParams {
  ordenId: string;
  nroTicket: string;
  monto: number;
  clienteNombre: string;
  clienteEmail?: string;
  descripcion: string;
}

export async function crearPreferenciaPago(params: CrearPreferenciaParams) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Estructura de preferencia compatible con la API de MercadoPago v1/checkout/preferences
    const preference = {
      items: [
        {
          id: params.ordenId,
          title: `Servicio de Lavado - Ticket #${params.nroTicket}`,
          description: params.descripcion,
          quantity: 1,
          currency_id: "PEN",
          unit_price: params.monto,
        },
      ],
      payer: {
        name: params.clienteNombre,
        email: params.clienteEmail || "cliente@washmaster.pe",
      },
      back_urls: {
        success: `${baseUrl}/consulta/${params.nroTicket}?status=success`,
        failure: `${baseUrl}/consulta/${params.nroTicket}?status=failure`,
        pending: `${baseUrl}/consulta/${params.nroTicket}?status=pending`,
      },
      auto_return: "approved",
      external_reference: params.ordenId,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    };

    return {
      success: true,
      initPoint: `https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=demo_${params.ordenId.substring(0, 8)}`,
      preferenceId: `pref_${params.ordenId.substring(0, 8)}`,
      payload: preference,
    };
  } catch (error) {
    console.error("Error al crear preferencia de pago:", error);
    return { success: false, error: "Error al generar enlace de pago" };
  }
}
