export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import type { ImpresoraConfig } from "@/app/(dashboard)/configuracion/components/impresora-types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const sucursalId = session.user.sucursalId;

    let sucursalInfo = {
      nombre: "WashMaster Pro - Sucursal Principal",
      direccion: "Av. La Marina 1450, San Miguel, Lima",
      telefono: "(01) 456-7890",
      ruc: "RUC: 20601234567",
      logoUrl: "/logo-shield.png",
      config: {} as Record<string, unknown>,
    };

    if (sucursalId) {
      const [suc] = await db
        .select()
        .from(sucursales)
        .where(eq(sucursales.id, sucursalId));
      if (suc) {
        sucursalInfo = {
          nombre: suc.nombre,
          direccion: suc.direccion || sucursalInfo.direccion,
          telefono: suc.telefono || sucursalInfo.telefono,
          ruc: suc.ruc ? `RUC: ${suc.ruc}` : sucursalInfo.ruc,
          logoUrl: suc.logoUrl || sucursalInfo.logoUrl,
          config: (suc.config as Record<string, unknown>) || {},
        };
      }
    }

    const { searchParams } = new URL(request.url);
    const savedConfig = (sucursalInfo.config?.impresora as Partial<ImpresoraConfig>) || {};

    const anchoPapel = (searchParams.get("ancho") as "80mm" | "58mm") || savedConfig.anchoPapel || "80mm";
    const is58mm = anchoPapel === "58mm";
    const mostrarLogo = searchParams.get("logo") ? searchParams.get("logo") === "true" : savedConfig.mostrarLogo !== false;
    const mensajePie = searchParams.get("pie") || savedConfig.mensajePie || "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.";
    const copias = Number(searchParams.get("copias") || savedConfig.copias || 1);
    const preset = searchParams.get("preset") || savedConfig.modeloPreset || "epson-80";

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/consulta/TEST-001`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: is58mm ? 100 : 130,
      margin: 1,
      color: { dark: "#111", light: "#fff" },
    });

    const fecha = new Date().toLocaleString("es-PE");

    const renderSlip = (tituloCopia: string, esCopiaLavador = false) => `
      <div class="ticket-slip">
        ${mostrarLogo && sucursalInfo.logoUrl ? `
          <div class="center" style="margin-bottom: 4px;">
            <img src="${sucursalInfo.logoUrl}" alt="Logo" style="max-height: ${is58mm ? "30px" : "40px"}; max-width: 80%; object-fit: contain;" />
          </div>
        ` : ""}

        <div class="center">
          <div class="bold" style="font-size: ${is58mm ? "11px" : "13px"}; letter-spacing: 1px;">${sucursalInfo.nombre}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; margin-top: 2px; color: #444;">${sucursalInfo.ruc}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #444;">${sucursalInfo.direccion}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #444;">${sucursalInfo.telefono}</div>
        </div>

        <div class="divider"></div>

        <div class="center">
          <div style="font-size: ${is58mm ? "10px" : "12px"}; font-weight: bold;">TICKET DE PRUEBA: #PRUEBA-001</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #666; margin-top: 1px;">Fecha: ${fecha}</div>
          <div style="font-size: 7px; color: #0284c7; font-weight: bold; margin-top: 2px;">
            [ PRESET: ${(preset).toUpperCase()} - ${anchoPapel} ]
          </div>
          ${tituloCopia ? `<div style="font-size: 8px; font-weight: bold; margin-top: 3px; background: #eee; padding: 1px;">${tituloCopia}</div>` : ""}
        </div>

        <div class="divider"></div>

        <div class="row"><span class="bold">PLACA:</span><span class="placa">ABC-123</span></div>
        <div class="row"><span class="bold">VEHÍCULO:</span><span>TOYOTA HILUX 2024</span></div>
        <div class="row"><span class="bold">TIPO:</span><span>CAMIONETA / SUV</span></div>
        <div class="row"><span class="bold">COLOR:</span><span>BLANCO PERLADO</span></div>
        <div class="row" style="margin-top: 2px;"><span class="bold">CLIENTE:</span><span>JUAN PÉREZ GARCÍA</span></div>
        <div class="row"><span class="bold">CELULAR:</span><span>987 654 321</span></div>

        <div class="divider"></div>

        <div class="table-h">
          <span>Servicio</span>
          ${esCopiaLavador ? "" : "<span>Importe</span>"}
        </div>
        <div class="table-r">
          <span>1. Lavado Premium Completo</span>
          ${esCopiaLavador ? "" : "<span>S/ 45.00</span>"}
        </div>
        <div class="table-r">
          <span>2. Cera Cerámica Hidrofóbica</span>
          ${esCopiaLavador ? "" : "<span>S/ 25.00</span>"}
        </div>
        <div class="table-r">
          <span>3. Siliconado Tablero & Llantas</span>
          ${esCopiaLavador ? "" : "<span>S/ 10.00</span>"}
        </div>

        ${esCopiaLavador ? `
          <div class="divider"></div>
          <div class="row"><span class="bold">BAHÍA ASIGNADA:</span><span class="bold">BAHÍA 02</span></div>
          <div class="row"><span class="bold">LAVADOR:</span><span>CARLOS MENDOZA</span></div>
          <div style="border: 1px dashed #333; padding: 4px; margin-top: 4px; font-size: 7px; text-align: center;">
            CONTROL DE PARABRISAS (RETIRAR AL ENTREGAR)
          </div>
        ` : `
          <div class="divider"></div>
          <div class="row"><span class="bold">SUBTOTAL:</span><span>S/ 80.00</span></div>
          <div class="row"><span class="bold">DESCUENTO:</span><span>- S/ 5.00</span></div>
          <div class="total"><span>TOTAL:</span><span>S/ 75.00</span></div>
          <div class="row" style="margin-top: 2px;"><span class="bold">MÉTODO:</span><span>YAPE / PLIN</span></div>
        `}

        <div class="divider"></div>

        <div style="text-align: center; margin: 6px 0;">
          <img src="${qrDataUrl}" alt="QR" style="width:${is58mm ? "60px" : "75px"};height:${is58mm ? "60px" : "75px"};display:inline-block;" />
        </div>
        <div style="text-align: center; font-size: 6px; color: #666;">Escanea para seguir el estado en vivo</div>

        <div class="footer">
          <div class="bold" style="white-space: pre-line; line-height: 1.3;">${mensajePie}</div>
          <div style="margin-top: 4px; font-size: 6px; color: #888;">--- CALIBRACIÓN EXITOSA DE IMPRESORA ---</div>
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ticket de Prueba (${anchoPapel})</title>
<style>
  @page {
    size: ${anchoPapel} auto;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'Courier New', monospace;
    font-size: ${is58mm ? "8px" : "9px"};
    color: #111;
    width: ${anchoPapel};
    max-width: ${anchoPapel};
    padding: ${is58mm ? "2mm 1.5mm" : "3mm 3mm"};
    margin: 0 auto;
    line-height: 1.25;
  }
  .ticket-slip {
    page-break-after: always;
  }
  .ticket-slip:last-child {
    page-break-after: auto;
  }
  .cut-guide {
    text-align: center;
    border-top: 1px dashed #666;
    margin: 12px 0 10px;
    padding-top: 4px;
    font-size: 7px;
    color: #777;
    letter-spacing: 2px;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #999; margin: 5px 0; }
  .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .placa { font-weight: bold; font-size: ${is58mm ? "9px" : "10px"}; letter-spacing: 1.5px; background: #eee; padding: 1px 4px; }
  .table-h { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 2px; margin-bottom: 2px; font-weight: bold; }
  .table-r { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: ${is58mm ? "7.5px" : "8.5px"}; }
  .total { display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 3px; margin-top: 3px; font-weight: bold; font-size: ${is58mm ? "9px" : "11px"}; }
  .footer { text-align: center; margin-top: 8px; font-size: ${is58mm ? "6.5px" : "7.5px"}; color: #444; }
</style>
</head>
<body>
  ${renderSlip(copias === 2 ? "COPIA CLIENTE" : "")}
  ${copias === 2 ? `
    <div class="cut-guide">✂ - - - CORTE DE PAPEL / GUILLOTINA - - - ✂</div>
    ${renderSlip("COPIA LAVADOR / PARABRISAS", true)}
  ` : ""}

  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="ticket-test.html"',
      },
    });
  } catch (error) {
    console.error("Error al generar ticket de prueba:", error);
    return NextResponse.json({ error: "Error al generar ticket de prueba" }, { status: 500 });
  }
}
