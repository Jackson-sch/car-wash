import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liquidacionesComisiones, usuarios, sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [liq] = await db
      .select({
        id: liquidacionesComisiones.id,
        fechaDesde: liquidacionesComisiones.fechaDesde,
        fechaHasta: liquidacionesComisiones.fechaHasta,
        totalOrdenes: liquidacionesComisiones.totalOrdenes,
        montoTotal: liquidacionesComisiones.montoTotal,
        metodoPago: liquidacionesComisiones.metodoPago,
        referencia: liquidacionesComisiones.referencia,
        notas: liquidacionesComisiones.notas,
        createdAt: liquidacionesComisiones.createdAt,
        empleadoNombre: usuarios.nombre,
        empleadoApellido: usuarios.apellido,
        empleadoEmail: usuarios.email,
        empleadoTelefono: usuarios.telefono,
        sucursalNombre: sucursales.nombre,
        sucursalDireccion: sucursales.direccion,
        sucursalTelefono: sucursales.telefono,
        sucursalRuc: sucursales.ruc,
      })
      .from(liquidacionesComisiones)
      .innerJoin(usuarios, eq(liquidacionesComisiones.empleadoId, usuarios.id))
      .innerJoin(sucursales, eq(liquidacionesComisiones.sucursalId, sucursales.id))
      .where(eq(liquidacionesComisiones.id, id))
      .limit(1);

    if (!liq) {
      return NextResponse.json({ error: "Liquidación no encontrada" }, { status: 404 });
    }

    const fechaCreacion = liq.createdAt
      ? new Date(liq.createdAt).toLocaleString("es-PE")
      : new Date().toLocaleString("es-PE");
    const fechaDesdeStr = new Date(liq.fechaDesde).toLocaleDateString("es-PE");
    const fechaHastaStr = new Date(liq.fechaHasta).toLocaleDateString("es-PE");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Voucher Liquidacion ${liq.id.substring(0, 8)}</title>
<style>
  @page { size: A4 portrait; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    line-height: 1.4;
  }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
  .company { font-size: 16px; font-weight: bold; color: #0284c7; }
  .title { font-size: 14px; font-weight: bold; text-align: right; text-transform: uppercase; color: #333; }
  .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; bg: #f8fafc; }
  .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .bold { font-weight: bold; }
  .table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
  .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
  .table th { background: #0284c7; color: white; font-size: 10px; text-transform: uppercase; }
  .signatures { display: flex; justify-content: space-around; margin-top: 60px; }
  .sign-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 6px; font-weight: bold; font-size: 10px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${liq.sucursalNombre}</div>
      <div>RUC: ${liq.sucursalRuc || "10000000001"}</div>
      <div>${liq.sucursalDireccion || "Sucursal Principal"}</div>
      <div>Teléfono: ${liq.sucursalTelefono || "—"}</div>
    </div>
    <div style="text-align: right;">
      <div class="title">COMPROBANTE DE LIQUIDACIÓN DE COMISIONES</div>
      <div style="color: #64748b; font-size: 10px; margin-top: 4px;">Nº REGISTRO: ${liq.id.substring(0, 13).toUpperCase()}</div>
      <div style="color: #64748b; font-size: 10px;">Fecha Emisión: ${fechaCreacion}</div>
    </div>
  </div>

  <div class="box">
    <div class="row"><span class="bold">Empleado / Lavador:</span> <span>${liq.empleadoNombre} ${liq.empleadoApellido || ""}</span></div>
    <div class="row"><span class="bold">Correo Electrónico:</span> <span>${liq.empleadoEmail || "—"}</span></div>
    <div class="row"><span class="bold">Periodo Liquidado:</span> <span>${fechaDesdeStr} al ${fechaHastaStr}</span></div>
    <div class="row"><span class="bold">Método de Pago:</span> <span style="text-transform: uppercase;">${liq.metodoPago} ${liq.referencia ? `(Ref: ${liq.referencia})` : ""}</span></div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Concepto</th>
        <th style="text-align: center;">Cantidad de Servicios</th>
        <th style="text-align: right;">Monto Total Acumulado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Comisión de Servicios de Lavado (30% sobre ventas)</td>
        <td style="text-align: center;">${liq.totalOrdenes} órdenes</td>
        <td style="text-align: right; font-weight: bold; color: #0284c7;">S/ ${parseFloat(liq.montoTotal).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  ${liq.notas ? `<div style="margin-bottom: 20px; font-style: italic; font-size: 10px; color: #475569;">Nota / Observaciones: ${liq.notas}</div>` : ""}

  <div class="signatures">
    <div class="sign-box">
      FIRMA ADMINISTRADOR / CAJA<br>
      <span style="font-weight: normal; font-size: 9px; color: #64748b;">${liq.sucursalNombre}</span>
    </div>
    <div class="sign-box">
      FIRMA DE CONFORMIDAD LAVADOR<br>
      <span style="font-weight: normal; font-size: 9px; color: #64748b;">${liq.empleadoNombre} ${liq.empleadoApellido || ""}</span>
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="liquidacion-${liq.id}.html"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de liquidación:", error);
    return NextResponse.json({ error: "Error al generar comprobante de liquidación" }, { status: 500 });
  }
}
