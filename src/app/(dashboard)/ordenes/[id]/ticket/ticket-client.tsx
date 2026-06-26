"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Download,
  Save,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registrarComprobanteSunat } from "@/lib/actions/ordenes";

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
  vehiculoTipo:
    | "sedan"
    | "suv"
    | "pickup"
    | "moto"
    | "camion"
    | "furgon"
    | "otro"
    | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  lavadorId: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
  servicios: ServicioAsociado[];
  comprobanteTipo: string | null;
  comprobanteSerie: string | null;
  comprobanteNumero: string | null;
  facturadoAt: Date | null;
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
  const [hidePrices, setHidePrices] = useState(false);

  // Estados para el formulario de SUNAT
  const [tipo, setTipo] = useState<"boleta" | "factura" | "ninguno">(
    (orden.comprobanteTipo as "boleta" | "factura") || "ninguno",
  );
  const [serie, setSerie] = useState(orden.comprobanteSerie || "");
  const [numero, setNumero] = useState(orden.comprobanteNumero || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sincronizar estado cuando cambian las props
  useEffect(() => {
    setTipo((orden.comprobanteTipo as "boleta" | "factura") || "ninguno");
    setSerie(orden.comprobanteSerie || "");
    setNumero(orden.comprobanteNumero || "");
  }, [orden.comprobanteTipo, orden.comprobanteSerie, orden.comprobanteNumero]);

  // Manejar cambio de tipo y autocompletar serie estándar
  const handleTipoChange = (newTipo: "boleta" | "factura" | "ninguno") => {
    setTipo(newTipo);
    if (newTipo === "boleta" && (!serie || serie === "F001")) {
      setSerie("B001");
    } else if (newTipo === "factura" && (!serie || serie === "B001")) {
      setSerie("F001");
    } else if (newTipo === "ninguno") {
      setSerie("");
      setNumero("");
    }
  };

  const handleSaveComprobante = () => {
    startTransition(async () => {
      const targetTipo = tipo === "ninguno" ? null : tipo;
      const res = await registrarComprobanteSunat({
        ordenId: orden.id,
        tipo: targetTipo,
        serie: targetTipo ? serie : undefined,
        numero: targetTipo ? numero : undefined,
      });

      if (res.success) {
        toast.success(
          tipo === "ninguno"
            ? "Comprobante removido. El ticket vuelve a figurar como Nota de Venta."
            : "Comprobante registrado correctamente en el sistema.",
        );
        router.refresh();
      } else {
        toast.error(
          res.error || "Ocurrió un error al registrar el comprobante",
        );
      }
    });
  };

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

  const handlePrint = () => {
    const query = hidePrices ? "?mode=work" : "";
    window.open(`/api/pdf/ticket/${orden.id}${query}`, "_blank");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#print") {
      const timer = setTimeout(() => {
        window.print();
        window.location.hash = "";
      }, 650);
      return () => clearTimeout(timer);
    }
  }, []);

  const nombreSucursal = sucursal?.nombre || "WashMaster Pro";
  const rucSucursal = sucursal?.ruc || "RUC 20987654321";
  const direccionSucursal = sucursal?.direccion || "Av. Las Camelias 450, Lima";
  const telefonoSucursal = sucursal?.telefono || "Telf: (01) 456-7890";
  const emailSucursal = sucursal?.email || "contacto@washmaster.com";
  const puntosGanados = Math.round(parseFloat(orden.total || "0"));

  return (
    <div className="space-y-8">
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
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Reset completo de zinc dentro del ticket (light values hardcoded) ── */
        #print-area {
          /* Variables nativas que usa tu globals.css */
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

        @media print {
          body {
            background: white !important;
          }
          aside,
          header,
          main > div > div:first-child,
          button,
          a {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area {
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}} />

      {/* ── Header Actions ──────────────────────────────────────────────────── */}
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
              Imprime el ticket físico para el parabrisas del auto o registro
              del cliente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2 bg-muted/45 border border-border px-3.5 py-1.5 rounded-xl h-10 select-none">
            <Switch
              id="hide-prices-toggle"
              checked={hidePrices}
              onCheckedChange={setHidePrices}
              className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40"
            />
            <Label htmlFor="hide-prices-toggle" className="text-xs font-bold text-foreground cursor-pointer select-none">
              Ocultar precios (Personal)
            </Label>
          </div>
          <Button
            onClick={() => window.open(`/api/pdf/ticket/${orden.id}${hidePrices ? "?mode=work" : ""}`, "_blank")}
            variant="outline"
            className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 h-10 rounded-lg gap-2 cursor-pointer px-4"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-5"
          >
            <Printer className="h-4 w-4" />
            {hidePrices ? "Imprimir Trabajo" : "Imprimir Ticket"}
          </Button>
        </div>
      </div>

      {/* ── Ticket Preview & Control Panel ──────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 p-6 bg-card rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Vista previa del Ticket */}
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
              <h2
                className="font-extrabold text-lg uppercase tracking-wider"
                style={{ color: "#111111" }}
              >
                {nombreSucursal}
              </h2>
              <p
                className="text-[10px] mt-0.5 font-bold"
                style={{ color: "#333333" }}
              >
                {rucSucursal}
              </p>
              <p
                className="text-[10px] mt-0.5 leading-tight"
                style={{ color: "#444444" }}
              >
                {direccionSucursal}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#444444" }}>
                {telefonoSucursal}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "#666666" }}>
                {emailSucursal}
              </p>
            </div>

            <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
              --------------------------------
            </p>

            {/* Ticket Number / SUNAT Voucher */}
            <div>
              {orden.comprobanteTipo ? (
                <>
                  <div
                    className="text-[9px] font-black uppercase tracking-wider"
                    style={{ color: "#111111" }}
                  >
                    {orden.comprobanteTipo === "boleta"
                      ? "BOLETA DE VENTA ELECTRÓNICA"
                      : "FACTURA ELECTRÓNICA"}
                  </div>
                  <div
                    className="text-sm font-black mt-1"
                    style={{ color: "#111111" }}
                  >
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
              <p
                className="text-[9px] mt-1.5"
                style={{ color: "#666666" }}
                suppressHydrationWarning
              >
                Fecha:{" "}
                {orden.createdAt
                  ? new Date(orden.createdAt).toLocaleString("es-PE")
                  : "Fecha actual"}
              </p>
            </div>

            <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
              --------------------------------
            </p>

            {/* Vehículo & Cliente */}
            <div
              className="text-left space-y-1 text-[10px]"
              style={{ color: "#111111" }}
            >
              <div className="flex justify-between items-center font-bold">
                <span>PLACA:</span>
                <span
                  className="ticket-placa-badge text-xs font-black px-2 py-0.5 tracking-wider"
                  style={{
                    background: "#111111",
                    color: "#ffffff",
                    border: "1px solid #111111",
                  }}
                >
                  {orden.placa}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>VEHÍCULO:</span>
                <span style={{ color: "#111111" }} className="capitalize">
                  {orden.vehiculoMarca || "Genérico"}{" "}
                  {orden.vehiculoModelo || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>TIPO:</span>
                <span style={{ color: "#111111" }} className="capitalize">
                  {orden.vehiculoTipo || "Sedan"}
                </span>
              </div>
              {orden.vehiculoColor && (
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>COLOR:</span>
                  <span style={{ color: "#111111" }} className="capitalize">
                    {orden.vehiculoColor}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>CLIENTE:</span>
                <span style={{ color: "#111111" }}>
                  {orden.clienteNombre} {orden.clienteApellido || ""}
                </span>
              </div>
              {orden.clienteTelefono && (
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>CELULAR:</span>
                  <span style={{ color: "#111111" }}>
                    {orden.clienteTelefono}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
              --------------------------------
            </p>

            {/* Servicios */}
            <div className="text-left space-y-1.5 text-[10px]">
              <div
                className="flex justify-between font-bold pb-1"
                style={{ borderBottom: "1px solid #dddddd", color: "#111111" }}
              >
                <span>Servicio</span>
                {!hidePrices && <span>Importe</span>}
              </div>
              {orden.servicios.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-start leading-tight"
                  style={{ color: "#222222" }}
                >
                  <span className="max-w-[180px]">
                    {s.nombreServicio} (x{s.cantidad || 1})
                  </span>
                  {!hidePrices && <span>S/ {parseFloat(s.subtotal).toFixed(2)}</span>}
                </div>
              ))}
            </div>

            <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
              --------------------------------
            </p>

            {!hidePrices && (
              <>
                <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
                  --------------------------------
                </p>

                {/* Totales */}
                <div className="text-left space-y-1 text-[10px]">
                  <div
                    className="flex justify-between"
                    style={{ color: "#444444" }}
                  >
                    <span>SUBTOTAL:</span>
                    <span>S/ {parseFloat(orden.subtotal || "0").toFixed(2)}</span>
                  </div>
                  {parseFloat(orden.descuento || "0") > 0 && (
                    <div
                      className="flex justify-between font-bold"
                      style={{ color: "#222222" }}
                    >
                      <span>DESCUENTO:</span>
                      <span>
                        - S/ {parseFloat(orden.descuento || "0").toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div
                    className="flex justify-between text-xs font-black pt-1"
                    style={{ borderTop: "1px solid #dddddd", color: "#111111" }}
                  >
                    <span>TOTAL:</span>
                    <span>S/ {parseFloat(orden.total || "0").toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Operación */}
            <div className="text-left text-[10px] space-y-1">
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>LAVADOR:</span>
                <span className="font-bold" style={{ color: "#111111" }}>
                  {orden.lavadorNombre
                    ? `${orden.lavadorNombre} ${orden.lavadorApellido || ""}`
                    : "SIN ASIGNAR"}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#555555" }}>ESTADO:</span>
                <span
                  className="font-bold uppercase"
                  style={{ color: "#111111" }}
                >
                  {orden.estado}
                </span>
              </div>
            </div>

            {orden.notas && (
              <>
                <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
                  --------------------------------
                </p>
                <div className="text-left text-[10px] space-y-1">
                  <span className="font-bold" style={{ color: "#111111" }}>
                    RECOMENDACIONES / NOTAS:
                  </span>
                  <div
                    className="italic leading-tight whitespace-pre-wrap mt-0.5"
                    style={{ color: "#333333" }}
                  >
                    {orden.notas}
                  </div>
                </div>
              </>
            )}

            {!hidePrices && (
              <>
                <p className="text-[10px]" style={{ color: "#aaaaaa" }}>
                  --------------------------------
                </p>

                {/* Loyalty */}
                <div
                  className="ticket-loyalty p-2 rounded space-y-1 text-[9px]"
                  style={{
                    background: "#111111",
                    border: "1px solid #111111",
                    color: "#ffffff",
                  }}
                >
                  <div
                    className="flex items-center justify-center gap-1 font-bold"
                    style={{ color: "#ffffff" }}
                  >
                    <ShieldCheck
                      className="h-3.5 w-3.5"
                      style={{ color: "#ffffff" }}
                    />
                    <span>PROGRAMA DE LEALTAD</span>
                  </div>
                  <p
                    className="text-center leading-tight"
                    style={{ color: "#cccccc" }}
                  >
                    Puntos ganados hoy:{" "}
                    <span className="font-bold" style={{ color: "#ffffff" }}>
                      {puntosGanados}
                    </span>
                  </p>
                  <p
                    className="text-center text-[8px] mt-0.5"
                    style={{ color: "#999999" }}
                  >
                    ¡Acumula puntos y canjea lavados gratis!
                  </p>
                </div>
              </>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2 space-y-1">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" className="h-[72px] w-[72px]" />
              ) : (
                <div
                  className="h-[72px] w-[72px] animate-pulse rounded"
                  style={{ background: "#f0f0f0" }}
                />
              )}
              <span
                className="text-[8px] tracking-wider"
                style={{ color: "#aaaaaa" }}
              >
                {orden.nroTicket || orden.id.substring(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Footer */}
            <div
              className="pt-2 text-[9px] font-bold text-center border-t border-dashed border-zinc-200"
              style={{ color: "#111111" }}
            >
              <p className="mt-1">¡MUCHAS GRACIAS POR SU PREFERENCIA!</p>
              <p
                className="mt-1 font-normal text-[8px]"
                style={{ color: "#aaaaaa" }}
              >
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
                  <p
                    className="font-normal text-[7px]"
                    style={{ color: "#aaaaaa" }}
                  >
                    Solicite su Boleta o Factura en caja
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Control SUNAT */}
        {(orden.estado === "cobrado" || orden.estado === "completado") && (
          <div className="w-full max-w-md bg-zinc-50 dark:bg-card p-6 rounded-3xl border border-border space-y-5 shadow-xs transition-all shrink-0">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50 shrink-0">
                <ShieldCheck className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">
                  Control de Comprobante SUNAT
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                  Registro manual (Portal SUNAT SOL)
                </p>
              </div>
            </div>

            <div className="text-xs bg-zinc-100/60 dark:bg-zinc-950/20 border border-zinc-200/40 dark:border-zinc-850/50 rounded-xl p-3 flex gap-2.5">
              <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="leading-normal">
                Usa este panel para registrar los datos del comprobante que
                hayas emitido formalmente en el portal SOL de SUNAT. El ticket
                impreso y el PDF del Car Wash se actualizarán mostrando la serie
                y número de la Boleta o Factura.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Selector de Tipo */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tipo de Comprobante
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ninguno", "boleta", "factura"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTipoChange(t)}
                      className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg border text-center transition-all cursor-pointer ${
                        tipo === t
                          ? "bg-secondary border-secondary text-secondary-foreground shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "ninguno" ? "Nota Venta" : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos Serie y Número */}
              {tipo !== "ninguno" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="serie-input"
                      className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Serie (4 letras/Núm.)
                    </label>
                    <Input
                      id="serie-input"
                      value={serie}
                      onChange={(e) =>
                        setSerie(e.target.value.toUpperCase().slice(0, 4))
                      }
                      placeholder={tipo === "boleta" ? "B001" : "F001"}
                      maxLength={4}
                      className="text-xs h-9 uppercase font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="numero-input"
                      className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Número (hasta 8 díg.)
                    </label>
                    <Input
                      id="numero-input"
                      value={numero}
                      onChange={(e) =>
                        setNumero(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      placeholder="00000045"
                      maxLength={8}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Botón de Guardar */}
              <Button
                onClick={handleSaveComprobante}
                disabled={
                  isPending || (tipo !== "ninguno" && (!serie || !numero))
                }
                className="w-full font-bold gap-2 text-xs rounded-xl shadow-sm h-10 mt-2 cursor-pointer animate-none"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {tipo === "ninguno"
                      ? "Quitar Comprobante"
                      : "Guardar Registro"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
