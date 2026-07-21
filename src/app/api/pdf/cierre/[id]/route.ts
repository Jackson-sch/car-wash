import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { turnosCaja, usuarios, sucursales, pagos, ordenes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [turno] = await db
      .select({
        id: turnosCaja.id,
        montoInicial: turnosCaja.montoInicial,
        montoFinal: turnosCaja.montoFinal,
        observaciones: turnosCaja.observaciones,
        apertura: turnosCaja.apertura,
        cierre: turnosCaja.cierre,
        usuarioNombre: usuarios.nombre,
        usuarioApellido: usuarios.apellido,
        sucursalNombre: sucursales.nombre,
        sucursalRuc: sucursales.ruc,
        sucursalDireccion: sucursales.direccion,
      })
      .from(turnosCaja)
      .innerJoin(usuarios, eq(turnosCaja.empleadoId, usuarios.id))
      .innerJoin(sucursales, eq(turnosCaja.sucursalId, sucursales.id))
      .where(eq(turnosCaja.id, id))
      .limit(1);

    if (!turno) {
      return NextResponse.json({ error: "Turno de caja no encontrado" }, { status: 404 });
    }

    // Calcular desglose de pagos por método durante este turno
    const resumenPagos = await db
      .select({
        metodo: pagos.metodo,
        total: sql<string>`sum(${pagos.monto})`,
        cantidad: sql<number>`count(${pagos.id})`,
      })
      .from(pagos)
      .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
      .where(eq(ordenes.turnoId, id))
      .groupBy(pagos.metodo);

    let totalEfectivo = 0;
    let totalYapePlin = 0;
    let totalTarjeta = 0;
    let totalOtros = 0;
    let totalGeneral = 0;

    resumenPagos.forEach((p) => {
      const monto = parseFloat(p.total || "0");
      totalGeneral += monto;
      if (p.metodo === "efectivo") totalEfectivo += monto;
      else if (p.metodo === "yape" || p.metodo === "plin") totalYapePlin += monto;
      else if (p.metodo === "tarjeta") totalTarjeta += monto;
      else totalOtros += monto;
    });

    const montoInicial = parseFloat(turno.montoInicial || "0");
    const efectivoEsperado = montoInicial + totalEfectivo;
    const efectivoReal = turno.montoFinal ? parseFloat(turno.montoFinal) : efectivoEsperado;
    const diferencia = efectivoReal - efectivoEsperado;

    const fechaApertura = turno.apertura ? new Date(turno.apertura).toLocaleString("es-PE") : "—";
    const fechaCierre = turno.cierre ? new Date(turno.cierre).toLocaleString("es-PE") : "EN CURSO";

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Arqueo de Caja #${turno.id.substring(0, 8).toUpperCase()}</title>
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
  .total { display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 4px; margin-top: 4px; font-weight: bold; font-size: 10px; }
  .box { border: 1px solid #999; padding: 5px; margin: 6px 0; text-align: center; }
</style>
</head>
<body>
  <div class="center">
    <div class="bold" style="font-size: 13px;">${turno.sucursalNombre}</div>
    <div style="font-size: 8px;">RUC: ${turno.sucursalRuc || "—"}</div>
    <div style="font-size: 8px;">${turno.sucursalDireccion || ""}</div>
    <div class="bold" style="font-size: 11px; margin-top: 4px;">INFORME DE CIERRE Y ARQUEO DE CAJA</div>
  </div>

  <div class="divider"></div>

  <div class="row"><span class="bold">CAJERO:</span><span>${turno.usuarioNombre} ${turno.usuarioApellido || ""}</span></div>
  <div class="row"><span class="bold">APERTURA:</span><span>${fechaApertura}</span></div>
  <div class="row"><span class="bold">CIERRE:</span><span>${fechaCierre}</span></div>
  <div class="row"><span class="bold">ESTADO:</span><span class="bold">${turno.cierre ? "CERRADO" : "ABIERTO"}</span></div>

  <div class="divider"></div>

  <div class="bold" style="margin-bottom: 4px;">RESUMEN DE VENTAS POR MEDIO DE PAGO:</div>
  <div class="row"><span>Monto Inicial (Base Caja):</span><span>S/ ${montoInicial.toFixed(2)}</span></div>
  <div class="row"><span>Ventas en Efectivo:</span><span>S/ ${totalEfectivo.toFixed(2)}</span></div>
  <div class="row"><span>Ventas Yape / Plin:</span><span>S/ ${totalYapePlin.toFixed(2)}</span></div>
  <div class="row"><span>Ventas Tarjeta:</span><span>S/ ${totalTarjeta.toFixed(2)}</span></div>
  ${totalOtros > 0 ? `<div class="row"><span>Otros Medios:</span><span>S/ ${totalOtros.toFixed(2)}</span></div>` : ""}

  <div class="total"><span>TOTAL RECAUDADO:</span><span>S/ ${totalGeneral.toFixed(2)}</span></div>

  <div class="divider"></div>

  <div class="bold" style="margin-bottom: 4px;">ARQUEO DE EFECTIVO EN FÍSICO:</div>
  <div class="row"><span>Efectivo Esperado en Caja:</span><span>S/ ${efectivoEsperado.toFixed(2)}</span></div>
  <div class="row"><span>Efectivo Contado (Real):</span><span>S/ ${efectivoReal.toFixed(2)}</span></div>
  
  <div class="box" style="background:${diferencia < 0 ? '#fff0f0' : diferencia > 0 ? '#f0fff0' : '#f9f9f9'}">
    <div class="bold">DIFERENCIA DE ARQUEO:</div>
    <div style="font-size: 12px; font-weight: bold; color: ${diferencia < 0 ? '#cc0000' : diferencia > 0 ? '#008800' : '#333'}">
      ${diferencia === 0 ? "CUADRE EXACTO (S/ 0.00)" : `S/ ${diferencia.toFixed(2)} (${diferencia < 0 ? "FALTANTE" : "SOBRANTE"})`}
    </div>
  </div>

  ${turno.observaciones ? `
  <div class="divider"></div>
  <div style="font-size: 8px;">
    <span class="bold">OBSERVACIONES DE CIERRE:</span>
    <div style="margin-top: 2px; font-style: italic;">${turno.observaciones}</div>
  </div>
  ` : ""}

  <div style="margin-top: 30px; text-align: center;">
    <div style="border-top: 1px solid #333; width: 60%; margin: 0 auto; padding-top: 4px; font-size: 8px;">
      Firma del Cajero / Responsable
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
        "Content-Disposition": `inline; filename="arqueo-caja-${turno.id.substring(0, 8)}.html"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de cierre:", error);
    return NextResponse.json({ error: "Error al generar el arqueo de caja" }, { status: 500 });
  }
}
