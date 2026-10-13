export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ordenes, vehiculos, clientes, usuarios, ordenServicios, sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import type { ImpresoraConfig } from "@/app/(dashboard)/configuracion/components/impresora-types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const mode = searchParams.get("mode");
    const isWorkMode = mode === "work";

    const [orden] = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        subtotal: ordenes.subtotal,
        descuento: ordenes.descuento,
        total: ordenes.total,
        notas: ordenes.notas,
        prioridad: ordenes.prioridad,
        createdAt: ordenes.createdAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoColor: vehiculos.color,
        vehiculoTipo: vehiculos.tipo,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
        sucursalNombre: sucursales.nombre,
        sucursalDireccion: sucursales.direccion,
        sucursalTelefono: sucursales.telefono,
        sucursalEmail: sucursales.email,
        sucursalRuc: sucursales.ruc,
        sucursalLogo: sucursales.logoUrl,
        sucursalConfig: sucursales.config,
        comprobanteTipo: ordenes.comprobanteTipo,
        comprobanteSerie: ordenes.comprobanteSerie,
        comprobanteNumero: ordenes.comprobanteNumero,
        facturadoAt: ordenes.facturadoAt,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id))
      .innerJoin(sucursales, eq(ordenes.sucursalId, sucursales.id))
      .where(eq(ordenes.id, id))
      .limit(1);

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const servicios = await db
      .select({
        nombreServicio: ordenServicios.nombreServicio,
        cantidad: ordenServicios.cantidad,
        subtotal: ordenServicios.subtotal,
      })
      .from(ordenServicios)
      .where(eq(ordenServicios.ordenId, id));

    const puntosGanados = Math.round(parseFloat(orden.total || "0"));
    const fecha = orden.createdAt
      ? new Date(orden.createdAt).toLocaleString("es-PE")
      : new Date().toLocaleString("es-PE");

    const cfg = (orden.sucursalConfig as { impresora?: Partial<ImpresoraConfig> } | null)?.impresora;
    const anchoPapel = cfg?.anchoPapel || "80mm";
    const is58mm = anchoPapel === "58mm";
    const mostrarLogo = cfg?.mostrarLogo !== false;
    const mensajePie = cfg?.mensajePie || "¡MUCHAS GRACIAS POR SU PREFERENCIA!\nConserve este ticket para retirar su vehículo.";
    const copias = Number(cfg?.copias || 1);
    const copiaLavador = cfg?.copiaLavador ?? false;

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/consulta/${orden.nroTicket || orden.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: is58mm ? 100 : 130,
      margin: 1,
      color: { dark: "#111", light: "#fff" },
    });

    const renderSlip = (tituloCopia: string, esCopiaLavador = false) => `
      <div class="ticket-slip">
        ${mostrarLogo && orden.sucursalLogo ? `
          <div class="center" style="margin-bottom: 4px;">
            <img src="${orden.sucursalLogo}" alt="Logo" style="max-height: ${is58mm ? "30px" : "40px"}; max-width: 80%; object-fit: contain;" />
          </div>
        ` : ""}

        <div class="center">
          <div class="bold" style="font-size: ${is58mm ? "11px" : "13px"}; letter-spacing: 1px;">${orden.sucursalNombre}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; margin-top: 2px; color: #444;">${orden.sucursalRuc ? `RUC: ${orden.sucursalRuc}` : "RUC"}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #444;">${orden.sucursalDireccion || ""}</div>
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #444;">${orden.sucursalTelefono || ""}</div>
        </div>

        <div class="divider"></div>

        <div class="center">
          ${orden.comprobanteTipo 
            ? `<div style="font-size: ${is58mm ? "9px" : "11px"}; font-weight: bold; text-transform: uppercase;">${orden.comprobanteTipo === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA'}</div>
               <div style="font-size: ${is58mm ? "11px" : "13px"}; font-weight: bold; margin-top: 2px;">${orden.comprobanteSerie} - ${orden.comprobanteNumero}</div>
               <div style="font-size: 7px; color: #666; margin-top: 1px;">ASOCIADO A TICKET: ${orden.nroTicket || "—"}</div>`
            : `<div style="font-size: ${is58mm ? "11px" : "13px"}; font-weight: bold;">TICKET: ${orden.nroTicket || "—"}</div>`
          }
          <div style="font-size: ${is58mm ? "7px" : "8px"}; color: #666; margin-top: 2px;">Fecha: ${fecha}</div>
          ${tituloCopia ? `<div style="font-size: 8px; font-weight: bold; margin-top: 3px; background: #eee; padding: 1px;">${tituloCopia}</div>` : ""}
        </div>

        <div class="divider"></div>

        <div class="row"><span class="bold">PLACA:</span><span class="placa">${orden.placa}</span></div>
        <div class="row"><span class="bold">VEHÍCULO:</span><span>${orden.vehiculoMarca || "—"} ${orden.vehiculoModelo || ""}</span></div>
        <div class="row"><span class="bold">TIPO:</span><span>${(orden.vehiculoTipo || "Sedán").toUpperCase()}</span></div>
        ${orden.vehiculoColor ? `<div class="row"><span class="bold">COLOR:</span><span>${orden.vehiculoColor}</span></div>` : ""}
        <div class="row" style="margin-top: 3px;"><span class="bold">CLIENTE:</span><span>${orden.clienteNombre} ${orden.clienteApellido || ""}</span></div>
        ${orden.clienteTelefono ? `<div class="row"><span class="bold">CELULAR:</span><span>${orden.clienteTelefono}</span></div>` : ""}

        <div class="divider"></div>

        <div class="table-h">
          <span>Servicio</span>
          ${(isWorkMode || esCopiaLavador) ? "" : "<span>Importe</span>"}
        </div>
        ${servicios.map((s) => `
          <div class="table-r">
            <span>${s.nombreServicio} (x${s.cantidad || 1})</span>
            ${(isWorkMode || esCopiaLavador) ? "" : `<span>S/ ${parseFloat(s.subtotal).toFixed(2)}</span>`}
          </div>
        `).join("")}

        ${(isWorkMode || esCopiaLavador) ? "" : `
          <div class="divider"></div>
          <div class="row"><span class="bold">SUBTOTAL:</span><span>S/ ${parseFloat(orden.subtotal || "0").toFixed(2)}</span></div>
          ${parseFloat(orden.descuento || "0") > 0 ? `<div class="row"><span class="bold">DESCUENTO:</span><span>- S/ ${parseFloat(orden.descuento || "0").toFixed(2)}</span></div>` : ""}
          <div class="total"><span>TOTAL:</span><span>S/ ${parseFloat(orden.total || "0").toFixed(2)}</span></div>
        `}

        <div class="divider"></div>

        <div class="row"><span class="bold">LAVADOR:</span><span>${orden.lavadorNombre ? `${orden.lavadorNombre} ${orden.lavadorApellido || ""}` : "SIN ASIGNAR"}</span></div>
        <div class="row"><span class="bold">ESTADO:</span><span class="bold">${orden.estado.toUpperCase()}</span></div>

        ${orden.notas ? `
          <div class="divider"></div>
          <div style="text-align: left; font-size: 8px; line-height: 1.2;">
            <span class="bold">NOTAS / RECOMENDACIONES:</span>
            <div style="margin-top: 2px; font-style: italic; white-space: pre-wrap;">${orden.notas}</div>
          </div>
        ` : ""}

        ${(isWorkMode || esCopiaLavador) ? "" : `
          <div class="divider"></div>
          <div class="loyalty">
            <div class="bold">PROGRAMA DE LEALTAD</div>
            <div style="margin-top: 2px;">Puntos ganados hoy: ${puntosGanados}</div>
            <div style="margin-top: 1px; color: #888;">Acumula puntos y canjea lavados gratis</div>
          </div>
        `}

        <div style="text-align: center; margin: 6px 0;">
          <img src="${qrDataUrl}" alt="QR" style="width:${is58mm ? "60px" : "75px"};height:${is58mm ? "60px" : "75px"};display:inline-block;" />
        </div>
        <div style="text-align: center; font-size: 6px; color: #666; margin-top: 1px;">Escanea el QR para ver el estado de tu lavado en vivo</div>
        <div style="text-align: center; font-size: 6px; color: #999; margin-top: 1px;">${orden.nroTicket || orden.id.toString().substring(0, 8).toUpperCase()}</div>

        <div class="footer">
          <div class="bold" style="margin-bottom: 2px; white-space: pre-line;">${mensajePie}</div>
          ${isWorkMode || esCopiaLavador
            ? `<div style="font-size: 7px; color: #555; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 3px; text-transform: uppercase;">TICKET DE TRABAJO - CONTROL DE BAHÍA</div>`
            : orden.comprobanteTipo
              ? `<div style="font-size: 7px; color: #555; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 3px;">COMPROBANTE EMITIDO EN EL PORTAL DE SUNAT</div>`
              : `<div style="font-size: 7px; color: #555; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 3px; text-transform: uppercase;">NOTA DE VENTA - SIN VALIDEZ TRIBUTARIA</div>
                 <div style="font-size: 6.5px; color: #666;">Solicite su Boleta o Factura en caja</div>`
          }
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ticket ${orden.nroTicket || ""}</title>
<style>
  @page {
    size: ${anchoPapel} auto;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'Courier New', Courier, monospace;
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
  .total { display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 3px; margin-top: 3px; font-weight: bold; font-size: ${is58mm ? "9px" : "10px"}; }
  .loyalty { border: 1px solid #999; padding: 3px 5px; margin: 5px 0; text-align: center; font-size: 7px; }
  .footer { text-align: center; margin-top: 8px; font-size: 7px; color: #555; }
</style>
</head>
<body>
  ${renderSlip(copias === 2 ? "COPIA CLIENTE" : "")}
  ${copias === 2 ? `
    <div class="cut-guide">✂ - - - CORTE DE PAPEL / GUILLOTINA - - - ✂</div>
    ${renderSlip(copiaLavador ? "COPIA LAVADOR / PARABRISAS" : "COPIA ARCHIVO INTERNO", copiaLavador)}
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
        "Content-Disposition": `inline; filename="ticket-${orden.nroTicket || orden.id}.html"`,
      },
    });
  } catch (error) {
    console.error("Error al generar ticket:", error);
    return NextResponse.json({ error: "Error al generar el ticket" }, { status: 500 });
  }
}
