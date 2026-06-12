import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ordenes, vehiculos, clientes, usuarios, ordenServicios, sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ordenes/${orden.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 140, margin: 1, color: { dark: "#111", light: "#fff" } });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ticket ${orden.nroTicket || ""}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 9px;
    color: #111;
    width: 80mm;
    padding: 3mm 3mm;
    margin: 0 auto;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #999; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .placa { font-weight: bold; font-size: 10px; letter-spacing: 1.5px; background: #f0f0f0; padding: 1px 4px; }
  .table-h { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 3px; font-weight: bold; }
  .table-r { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .total { display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 4px; margin-top: 4px; font-weight: bold; font-size: 10px; }
  .loyalty { border: 1px solid #999; padding: 4px 6px; margin: 6px 0; text-align: center; font-size: 7px; }
  .footer { text-align: center; margin-top: 12px; font-size: 7px; color: #666; }
</style>
</head>
<body>
  <div class="center">
    <div class="bold" style="font-size: 14px; letter-spacing: 2px;">${orden.sucursalNombre}</div>
    <div style="font-size: 8px; margin-top: 2px; color: #444;">${orden.sucursalRuc || "RUC"}</div>
    <div style="font-size: 8px; color: #444;">${orden.sucursalDireccion || ""}</div>
    <div style="font-size: 8px; color: #444;">${orden.sucursalTelefono || ""}</div>
  </div>

  <div class="divider"></div>

  <div class="center">
    <div style="font-size: 13px; font-weight: bold;">${orden.nroTicket || "TICKET"}</div>
    <div style="font-size: 8px; color: #666;">Fecha: ${fecha}</div>
  </div>

  <div class="divider"></div>

  <div class="row"><span class="bold">PLACA:</span><span class="placa">${orden.placa}</span></div>
  <div class="row"><span class="bold">VEHÍCULO:</span><span>${orden.vehiculoMarca || "—"} ${orden.vehiculoModelo || ""}</span></div>
  <div class="row"><span class="bold">TIPO:</span><span>${(orden.vehiculoTipo || "Sedán").toUpperCase()}</span></div>
  ${orden.vehiculoColor ? `<div class="row"><span class="bold">COLOR:</span><span>${orden.vehiculoColor}</span></div>` : ""}
  <div class="row" style="margin-top: 4px;"><span class="bold">CLIENTE:</span><span>${orden.clienteNombre} ${orden.clienteApellido || ""}</span></div>
  ${orden.clienteTelefono ? `<div class="row"><span class="bold">CELULAR:</span><span>${orden.clienteTelefono}</span></div>` : ""}

  <div class="divider"></div>

  <div class="table-h"><span>Servicio</span><span>Importe</span></div>
  ${servicios.map((s) => `<div class="table-r"><span>${s.nombreServicio} (x${s.cantidad || 1})</span><span>S/ ${parseFloat(s.subtotal).toFixed(2)}</span></div>`).join("")}

  <div class="divider"></div>

  <div class="row"><span class="bold">SUBTOTAL:</span><span>S/ ${parseFloat(orden.subtotal || "0").toFixed(2)}</span></div>
  ${parseFloat(orden.descuento || "0") > 0 ? `<div class="row"><span class="bold">DESCUENTO:</span><span>- S/ ${parseFloat(orden.descuento || "0").toFixed(2)}</span></div>` : ""}
  <div class="total"><span>TOTAL:</span><span>S/ ${parseFloat(orden.total || "0").toFixed(2)}</span></div>

  <div class="divider"></div>

  <div class="row"><span class="bold">LAVADOR:</span><span>${orden.lavadorNombre ? `${orden.lavadorNombre} ${orden.lavadorApellido || ""}` : "SIN ASIGNAR"}</span></div>
  <div class="row"><span class="bold">ESTADO:</span><span class="bold">${orden.estado.toUpperCase()}</span></div>

  <div class="divider"></div>

  <div class="loyalty">
    <div class="bold">PROGRAMA DE LEALTAD</div>
    <div style="margin-top: 2px;">Puntos ganados hoy: ${puntosGanados}</div>
    <div style="margin-top: 1px; color: #888;">Acumula puntos y canjea lavados gratis</div>
  </div>

  <div style="text-align: center; margin: 8px 0;">
    <img src="${qrDataUrl}" alt="QR" style="width:72px;height:72px;display:inline-block;" />
  </div>
  <div style="text-align: center; font-size: 6px; color: #999;">${orden.nroTicket || orden.id.toString().substring(0, 8).toUpperCase()}</div>

  <div class="footer">
    <div class="bold" style="margin-bottom: 2px;">¡MUCHAS GRACIAS POR SU PREFERENCIA!</div>
    <div>Conserve este ticket para retirar su vehículo.</div>
  </div>

  <script>
    window.onload = function() { window.print(); };
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
    console.error("Error al generar PDF:", error);
    return NextResponse.json({ error: "Error al generar el ticket" }, { status: 500 });
  }
}
