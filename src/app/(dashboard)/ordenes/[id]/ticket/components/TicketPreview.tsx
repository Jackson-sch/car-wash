"use client";

import { ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface ServicioAsociado {
  id: string;
  nombreServicio: string;
  precioUnitario: string;
  cantidad: number | null;
  subtotal: string;
}

interface OrdenDetail {
  id: string;
  nroTicket: string | null;
  estado: string;
  subtotal: string | null;
  descuento: string | null;
  total: string | null;
  notas: string | null;
  createdAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoColor: string | null;
  vehiculoTipo: string | null;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
  servicios: ServicioAsociado[];
  comprobanteTipo: string | null;
  comprobanteSerie: string | null;
  comprobanteNumero: string | null;
}

interface SucursalConfig {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logoUrl: string | null;
}

interface TicketPreviewProps {
  orden: OrdenDetail;
  sucursal: SucursalConfig | null;
  hidePrices: boolean;
}

/**
 * CSS inline para forzar valores light-mode de zinc dentro del ticket.
 * Esto es necesario porque Tailwind v4 resuelve --color-zinc-* a variables
 * CSS que se invierten en dark mode, haciendo invisible el texto del ticket
 * (que siempre tiene fondo blanco).
 */
const ticketCss = `
  #print-area {
    /* Variables nativas que usa globals.css */
    --zinc-50: #fafafa !important;
    --zinc-100: #f4f4f5 !important;
    --zinc-200: #e4e4e7 !important;
    --zinc-250: #dcdce0 !important;
    --zinc-300: #d4d4d8 !important;
    --zinc-350: #a1a3a8 !important;
    --zinc-400: #76777d !important;
    --zinc-450: #5e5f65 !important;
    --zinc-500: #45464d !important;
    --zinc-550: #3a3b40 !important;
    --zinc-600: #303236 !important;
    --zinc-650: #28292d !important;
    --zinc-700: #252527 !important;
    --zinc-750: #1f2023 !important;
    --zinc-800: #1c1c1e !important;
    --zinc-900: #151516 !important;
    --zinc-950: #0e0e10 !important;

    /* Variables que Tailwind v4 mapea internamente: --color-zinc-* */
    --color-zinc-50: #fafafa !important;
    --color-zinc-100: #f4f4f5 !important;
    --color-zinc-200: #e4e4e7 !important;
    --color-zinc-250: #dcdce0 !important;
    --color-zinc-300: #d4d4d8 !important;
    --color-zinc-350: #a1a3a8 !important;
    --color-zinc-400: #76777d !important;
    --color-zinc-450: #5e5f65 !important;
    --color-zinc-500: #45464d !important;
    --color-zinc-550: #3a3b40 !important;
    --color-zinc-600: #303236 !important;
    --color-zinc-650: #28292d !important;
    --color-zinc-700: #252527 !important;
    --color-zinc-750: #1f2023 !important;
    --color-zinc-800: #1c1c1e !important;
    --color-zinc-900: #151516 !important;
    --color-zinc-950: #0e0e10 !important;

    /* Color base del ticket siempre oscuro sobre blanco */
    color: #111111 !important;
    background: #ffffff !important;
  }

  /* Forzar color de texto en todos los descendientes */
  #print-area * {
    color: inherit;
  }

  /* Excepción: el badge de placa y loyalty block (fondos oscuros) */
  #print-area .ticket-placa-badge {
    background: #111111 !important;
    color: #ffffff !important;
  }
  #print-area .ticket-loyalty {
    background: #111111 !important;
    color: #ffffff !important;
    border-color: #111111 !important;
  }
  #print-area .ticket-loyalty * {
    color: #ffffff !important;
  }
`;

export function TicketPreview({ orden, sucursal, hidePrices }: TicketPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ordenes/${orden.id}`;

  useEffect(() => {
    QRCode.toDataURL(qrUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#111", light: "#fff" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [qrUrl]);

  const nombreSucursal = sucursal?.nombre || "WashMaster Pro";
  const rucSucursal = sucursal?.ruc || "RUC 20987654321";
  const direccionSucursal = sucursal?.direccion || "Av. Las Camelias 450, Lima";
  const telefonoSucursal = sucursal?.telefono || "Telf: (01) 456-7890";
  const emailSucursal = sucursal?.email || "contacto@washmaster.com";
  const puntosGanados = Math.round(parseFloat(orden.total || "0"));

  return (
    <>
      {/*
       * ─── CRITICAL FIX ───────────────────────────────────────────────────────
       * El ticket usa bg-white, pero en dark mode las variables CSS de Tailwind v4
       * (--color-zinc-900, --color-zinc-500, etc.) resuelven a valores claros
       * (ej. --zinc-900 = oklch(0.97...) ≈ blanco), haciendo el texto invisible.
       *
       * Solución: dentro de #print-area sobreescribimos TODAS las variables zinc
       * con sus valores hex light-mode. Así las clases text-zinc-* siempre
       * renderizan oscuro sobre el fondo blanco del ticket,
       * independientemente del modo activo en el resto de la app.
       * ────────────────────────────────────────────────────────────────────────
       */}
      <style dangerouslySetInnerHTML={{ __html: ticketCss }} />
      <div
        id="print-area"
        className="w-[320px] bg-white p-6 shadow-2xl relative border-t-8 border-b-8 border-dashed border-zinc-300 mx-auto lg:mx-0 shrink-0"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          color: "#111111",
        }}
      >
        <div className="space-y-4 text-center" style={{ color: "#111111" }}>
          {/* Brand Header */}
          <div>
            <h2 className="font-extrabold text-lg uppercase tracking-wider" style={{ color: "#111111" }}>
              {nombreSucursal}
            </h2>
            <p className="text-[10px] mt-0.5 font-bold" style={{ color: "#333333" }}>{rucSucursal}</p>
            <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#444444" }}>{direccionSucursal}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#444444" }}>{telefonoSucursal}</p>
            <p className="text-[9px] mt-0.5" style={{ color: "#666666" }}>{emailSucursal}</p>
          </div>

          <p className="text-[10px]" style={{ color: "#aaaaaa" }}>--------------------------------</p>

          {/* Ticket Number / Voucher */}
          <div>
            {orden.comprobanteTipo ? (
              <>
                <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#111111" }}>
                  {orden.comprobanteTipo === "boleta" ? "BOLETA DE VENTA ELECTRÓNICA" : "FACTURA ELECTRÓNICA"}
                </div>
                <div className="text-sm font-black mt-1" style={{ color: "#111111" }}>
                  {orden.comprobanteSerie} - {orden.comprobanteNumero}
                </div>
                <div className="text-[8px] mt-1 text-zinc-400 font-bold uppercase tracking-wider">
                  TICKET ASOCIADO: #{orden.nroTicket || "—"}
                </div>
              </>
            ) : (
              <h3 className="text-xl font-black" style={{ color: "#111111" }}>
                TICKET #{orden.nroTicket || "—"}
              </h3>
            )}
            <p className="text-[9px] mt-1.5" style={{ color: "#666666" }} suppressHydrationWarning>
              Fecha: {orden.createdAt ? new Date(orden.createdAt).toLocaleString("es-PE") : "Fecha actual"}
            </p>
          </div>

          <p className="text-[10px]" style={{ color: "#aaaaaa" }}>--------------------------------</p>

          {/* Vehicle & Client */}
          <div className="text-left space-y-1 text-[10px]" style={{ color: "#111111" }}>
            <div className="flex justify-between items-center font-bold">
              <span>PLACA:</span>
              <span className="ticket-placa-badge text-xs font-black px-2 py-0.5 tracking-wider"
                style={{ background: "#111111", color: "#ffffff", border: "1px solid #111111" }}>
                {orden.placa}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#555555" }}>VEHÍCULO:</span>
              <span style={{ color: "#111111" }} className="capitalize">
                {orden.vehiculoMarca || "Genérico"} {orden.vehiculoModelo || ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#555555" }}>TIPO:</span>
              <span style={{ color: "#111111" }} className="capitalize">{orden.vehiculoTipo || "Sedan"}</span>
            </div>
            {orden.vehiculoColor && (
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>COLOR:</span>
                <span style={{ color: "#111111" }} className="capitalize">{orden.vehiculoColor}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2">
              <span>CLIENTE:</span>
              <span style={{ color: "#111111" }}>{orden.clienteNombre} {orden.clienteApellido || ""}</span>
            </div>
            {orden.clienteTelefono && (
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>CELULAR:</span>
                <span style={{ color: "#111111" }}>{orden.clienteTelefono}</span>
              </div>
            )}
          </div>

          <p className="text-[10px]" style={{ color: "#aaaaaa" }}>--------------------------------</p>

          {/* Services */}
          <div className="text-left space-y-1.5 text-[10px]">
            <div className="flex justify-between font-bold pb-1" style={{ borderBottom: "1px solid #dddddd", color: "#111111" }}>
              <span>Servicio</span>
              {!hidePrices && <span>Importe</span>}
            </div>
            {orden.servicios.map((s) => (
              <div key={s.id} className="flex justify-between items-start leading-tight" style={{ color: "#222222" }}>
                <span className="max-w-[180px]">{s.nombreServicio} (x{s.cantidad || 1})</span>
                {!hidePrices && <span>S/ {parseFloat(s.subtotal).toFixed(2)}</span>}
              </div>
            ))}
          </div>

          {!hidePrices && (
            <>
              <div className="text-left space-y-1 text-[10px]">
                <div className="flex justify-between" style={{ color: "#444444" }}>
                  <span>SUBTOTAL:</span>
                  <span>S/ {parseFloat(orden.subtotal || "0").toFixed(2)}</span>
                </div>
                {parseFloat(orden.descuento || "0") > 0 && (
                  <div className="flex justify-between font-bold" style={{ color: "#222222" }}>
                    <span>DESCUENTO:</span>
                    <span>- S/ {parseFloat(orden.descuento || "0").toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black pt-1" style={{ borderTop: "1px solid #dddddd", color: "#111111" }}>
                  <span>TOTAL:</span>
                  <span>S/ {parseFloat(orden.total || "0").toFixed(2)}</span>
                </div>
              </div>

              <div className="text-left text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>LAVADOR:</span>
                  <span className="font-bold" style={{ color: "#111111" }}>
                    {orden.lavadorNombre ? `${orden.lavadorNombre} ${orden.lavadorApellido || ""}` : "SIN ASIGNAR"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>ESTADO:</span>
                  <span className="font-bold uppercase" style={{ color: "#111111" }}>{orden.estado}</span>
                </div>
              </div>
            </>
          )}

          {orden.notas && (
            <>
              <p className="text-[10px]" style={{ color: "#aaaaaa" }}>--------------------------------</p>
              <div className="text-left text-[10px] space-y-1">
                <span className="font-bold" style={{ color: "#111111" }}>RECOMENDACIONES / NOTAS:</span>
                <div className="italic leading-tight whitespace-pre-wrap mt-0.5" style={{ color: "#333333" }}>
                  {orden.notas}
                </div>
              </div>
            </>
          )}

          {!hidePrices && (
            <>
              <div className="ticket-loyalty p-2 rounded space-y-1 text-[9px]"
                style={{ background: "#111111", border: "1px solid #111111", color: "#ffffff" }}>
                <div className="flex items-center justify-center gap-1 font-bold" style={{ color: "#ffffff" }}>
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: "#ffffff" }} />
                  <span>PROGRAMA DE LEALTAD</span>
                </div>
                <p className="text-center leading-tight" style={{ color: "#cccccc" }}>
                  Puntos ganados hoy: <span className="font-bold" style={{ color: "#ffffff" }}>{puntosGanados}</span>
                </p>
                <p className="text-center text-[8px] mt-0.5" style={{ color: "#999999" }}>
                  ¡Acumula puntos y canjea lavados gratis!
                </p>
              </div>
            </>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center pt-2 space-y-1">
            {qrDataUrl ? (
              // next/image no soporta data: URLs (QR generado inline)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR" className="h-[72px] w-[72px]" />
            ) : (
              <div className="h-[72px] w-[72px] animate-pulse rounded" style={{ background: "#f0f0f0" }} />
            )}
            <span className="text-[8px] tracking-wider" style={{ color: "#aaaaaa" }}>
              {orden.nroTicket || orden.id.substring(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Footer */}
          <div className="pt-2 text-[9px] font-bold text-center border-t border-dashed border-zinc-200" style={{ color: "#111111" }}>
            <p className="mt-1">¡MUCHAS GRACIAS POR SU PREFERENCIA!</p>
            <p className="mt-1 font-normal text-[8px]" style={{ color: "#aaaaaa" }}>
              Conserve este ticket para retirar su vehículo.
            </p>
            {orden.comprobanteTipo ? (
              <p className="mt-2 text-[7.5px] font-bold tracking-tight text-zinc-500 uppercase border-t border-dashed border-zinc-200 pt-2">
                COMPROBANTE EMITIDO EN EL PORTAL DE SUNAT
              </p>
            ) : (
              <>
                <p className="mt-2 text-[7.5px] font-bold tracking-tight text-zinc-500 uppercase border-t border-dashed border-zinc-200 pt-2">
                  NOTA DE VENTA - SIN VALIDEZ TRIBUTARIA
                </p>
                <p className="font-normal text-[7px]" style={{ color: "#aaaaaa" }}>
                  Solicite su Boleta o Factura en caja
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
