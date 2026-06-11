"use client";

import { useEffect, useState } from "react";
import { Printer, ArrowLeft, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import QRCode from "qrcode";

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
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  prioridad: number | null;
  subtotal: string | null;
  descuento: string | null;
  total: string | null;
  notas: string | null;
  createdAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoColor: string | null;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro" | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  lavadorId: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
  servicios: ServicioAsociado[];
}

interface SucursalConfig {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logoUrl: string | null;
  config: unknown;
}

interface TicketClientProps {
  orden: OrdenDetail;
  sucursal: SucursalConfig | null;
}

export function TicketClient({ orden, sucursal }: TicketClientProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ordenes/${orden.id}`;

  useEffect(() => {
    QRCode.toDataURL(qrUrl, { width: 140, margin: 1, color: { dark: "#111", light: "#fff" } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [qrUrl]);

  const handlePrint = () => {
    window.print();
  };

  // Autodisparar impresión si el hash es #print
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#print") {
      const timer = setTimeout(() => {
        window.print();
        // Limpiar hash para evitar re-disparos al refrescar
        window.location.hash = "";
      }, 650);
      return () => clearTimeout(timer);
    }
  }, []);

  // Datos de contacto de la sucursal defaults
  const nombreSucursal = sucursal?.nombre || "WashMaster Pro";
  const rucSucursal = sucursal?.ruc || "RUC 20987654321";
  const direccionSucursal = sucursal?.direccion || "Av. Las Camelias 450, Lima";
  const telefonoSucursal = sucursal?.telefono || "Telf: (01) 456-7890";
  const emailSucursal = sucursal?.email || "contacto@washmaster.com";

  // Calcular puntos estimados ganados (1 punto por Sol del total)
  const puntosGanados = Math.round(parseFloat(orden.total || "0"));

  return (
    <div className="space-y-8">
      {/* Dynamic inline styles for print override */}
      <style jsx global>{`
        @media print {
          /* Ocultar barra lateral, cabeceras, botones y fondo */
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, main > div > div:first-child, button, a {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Mostrar únicamente el contenedor del ticket */
          #print-area {
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          #print-area * {
            color: black !important;
          }
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/ordenes" passHref>
            <Button
              variant="outline"
              className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 h-9 px-3 rounded-lg cursor-pointer animate-none"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 flex items-center gap-2">
              Ticket de Servicio
            </h1>
            <p className="text-xs text-zinc-500">
              Imprime el ticket físico para el parabrisas del auto o registro del cliente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open(`/api/pdf/ticket/${orden.id}`, "_blank")}
            variant="outline"
            className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 h-10 rounded-lg gap-2 cursor-pointer px-4"
          >
            <Download className="h-4.5 w-4.5" />
            PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-black hover:bg-zinc-800 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-5"
          >
            <Printer className="h-4.5 w-4.5" />
            Imprimir Ticket
          </Button>
        </div>
      </div>

      {/* Main Print Container Wrapper */}
      <div className="flex justify-center py-6 bg-card rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* The Ticket Layout */}
        <div
          id="print-area"
          className="w-[320px] bg-white text-zinc-950 p-6 shadow-2xl relative border-t-8 border-b-8 border-dashed border-zinc-300"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* Internal Ticket Content */}
          <div className="space-y-4 text-center">
            {/* Sucursal Brand Header */}
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-wider">{nombreSucursal}</h2>
              <p className="text-[10px] mt-0.5 font-bold">{rucSucursal}</p>
              <p className="text-[10px] mt-0.5 leading-tight">{direccionSucursal}</p>
              <p className="text-[10px] mt-0.5">{telefonoSucursal}</p>
              <p className="text-[9px] mt-0.5">{emailSucursal}</p>
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Ticket Identifier */}
            <div>
              <h3 className="text-xl font-black">{orden.nroTicket || "TICKET"}</h3>
              <p className="text-[9px] mt-0.5" suppressHydrationWarning>
                Fecha: {orden.createdAt ? new Date(orden.createdAt).toLocaleString("es-PE") : "Fecha actual"}
              </p>
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Vehículo & Cliente */}
            <div className="text-left space-y-1 text-[10px]">
              <div className="flex justify-between font-bold">
                <span>PLACA:</span>
                <span className="text-xs font-black bg-zinc-100 px-1 border border-zinc-300 tracking-wider">
                  {orden.placa}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VEHÍCULO:</span>
                <span className="capitalize">
                  {orden.vehiculoMarca || "Genérico"} {orden.vehiculoModelo || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TIPO:</span>
                <span className="capitalize">{orden.vehiculoTipo || "Sedan"}</span>
              </div>
              {orden.vehiculoColor && (
                <div className="flex justify-between">
                  <span>COLOR:</span>
                  <span className="capitalize">{orden.vehiculoColor}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>CLIENTE:</span>
                <span>
                  {orden.clienteNombre} {orden.clienteApellido || ""}
                </span>
              </div>
              {orden.clienteTelefono && (
                <div className="flex justify-between">
                  <span>CELULAR:</span>
                  <span>{orden.clienteTelefono}</span>
                </div>
              )}
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Services Detailed List */}
            <div className="text-left space-y-1.5 text-[10px]">
              <div className="flex justify-between font-bold border-b border-zinc-200 pb-1">
                <span>Servicio</span>
                <span>Importe</span>
              </div>
              {orden.servicios.map((s) => (
                <div key={s.id} className="flex justify-between items-start leading-tight">
                  <span className="max-w-[180px]">
                    {s.nombreServicio} (x{s.cantidad || 1})
                  </span>
                  <span>S/ {parseFloat(s.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Pricing Totals */}
            <div className="text-left space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>S/ {parseFloat(orden.subtotal || "0").toFixed(2)}</span>
              </div>
              {parseFloat(orden.descuento || "0") > 0 && (
                <div className="flex justify-between font-bold">
                  <span>DESCUENTO:</span>
                  <span>- S/ {parseFloat(orden.descuento || "0").toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-zinc-200">
                <span>TOTAL:</span>
                <span>S/ {parseFloat(orden.total || "0").toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Operating Info */}
            <div className="text-left text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>LAVADOR:</span>
                <span className="font-bold">
                  {orden.lavadorNombre
                    ? `${orden.lavadorNombre} ${orden.lavadorApellido || ""}`
                    : "SIN ASIGNAR"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ESTADO:</span>
                <span className="font-bold uppercase">{orden.estado}</span>
              </div>
            </div>

            <p className="text-[10px]">--------------------------------</p>

            {/* Loyalty points card section */}
            <div className="border border-zinc-300 p-2 rounded bg-zinc-50 space-y-1 text-[9px]">
              <div className="flex items-center justify-center gap-1 font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
                <span>PROGRAMA DE LEALTAD</span>
              </div>
              <p className="text-center text-zinc-600 leading-tight">
                Puntos ganados hoy: <span className="font-bold text-zinc-950">{puntosGanados}</span>
              </p>
              <p className="text-center text-[8px] text-zinc-400 mt-0.5">
                ¡Acumula puntos y canjea lavados gratis!
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2 space-y-1">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" className="h-[72px] w-[72px]" />
              ) : (
                <div className="h-[72px] w-[72px] bg-zinc-100 animate-pulse rounded" />
              )}
              <span className="text-[8px] text-zinc-400 tracking-wider">
                {orden.nroTicket || orden.id.substring(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Footer Message */}
            <div className="pt-2 text-[9px] font-bold">
              <p>¡MUCHAS GRACIAS POR SU PREFERENCIA!</p>
              <p className="mt-1 font-normal text-[8px] text-zinc-400">
                Conserve este ticket para retirar su vehículo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
