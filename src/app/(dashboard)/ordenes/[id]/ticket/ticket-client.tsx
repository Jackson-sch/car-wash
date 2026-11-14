"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Printer,
  ArrowLeft,
  Download,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registrarComprobanteSunat, getSiguienteCorrelativoComprobante } from "@/lib/actions/ordenes";
import { TicketPreview } from "./components/TicketPreview";
import { SunatControlPanel } from "./components/SunatControlPanel";
import { getWhatsAppTicketUrl } from "@/lib/whatsapp";

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
  const [hidePrices, setHidePrices] = useState(false);

  // Estados para el formulario de SUNAT
  const [tipo, setTipo] = useState<"boleta" | "factura" | "ninguno">(
    (orden.comprobanteTipo as "boleta" | "factura") || "ninguno",
  );
  const [serie, setSerie] = useState(orden.comprobanteSerie || "");
  const [numero, setNumero] = useState(orden.comprobanteNumero || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Manejar cambio de tipo y autocompletar serie/número correlativo automático
  const handleTipoChange = async (newTipo: "boleta" | "factura" | "ninguno") => {
    setTipo(newTipo);
    if (newTipo === "ninguno") {
      setSerie("");
      setNumero("");
      return;
    }

    const defaultSerie = newTipo === "boleta" ? "B001" : "F001";
    setSerie(defaultSerie);

    startTransition(async () => {
      const res = await getSiguienteCorrelativoComprobante(newTipo, defaultSerie);
      if (res.success) {
        setSerie(res.serie);
        setNumero(res.numero);
      }
    });
  };

  const handleSerieChange = (newSerie: string) => {
    const cleanSerie = newSerie.toUpperCase().slice(0, 4);
    setSerie(cleanSerie);
    if (cleanSerie.length === 4 && (tipo === "boleta" || tipo === "factura")) {
      startTransition(async () => {
        const res = await getSiguienteCorrelativoComprobante(tipo, cleanSerie);
        if (res.success) {
          setNumero(res.numero);
        }
      });
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

  const handleWhatsApp = useCallback(() => {
    if (!orden.clienteTelefono) {
      toast.error("El cliente no tiene teléfono celular registrado");
      return;
    }
    const url = getWhatsAppTicketUrl({
      clienteNombre: orden.clienteNombre,
      clienteTelefono: orden.clienteTelefono,
      placa: orden.placa,
      nroTicket: orden.nroTicket,
      total: orden.total,
      ordenId: orden.id,
      sucursalNombre: sucursal?.nombre,
    });
    if (url) window.open(url, "_blank");
  }, [orden, sucursal]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#print") {
      const timer = setTimeout(() => {
        window.print();
        window.location.hash = "";
      }, 650);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement;

      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/ordenes");
        return;
      }

      if (!isInput) {
        if (e.key.toLowerCase() === "p") {
          e.preventDefault();
          handlePrint();
        } else if (e.key.toLowerCase() === "w") {
          e.preventDefault();
          handleWhatsApp();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, handlePrint, handleWhatsApp]);

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground">

      {/* ── Header Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/ordenes" passHref>
            <Button
              variant="outline"
              className="border-border hover:bg-muted text-foreground h-10 px-3.5 rounded-xl cursor-pointer gap-2 font-bold"
              title="Volver a la Bandeja de Órdenes (Tecla: Esc)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Volver a Órdenes</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
                Esc
              </kbd>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
              Ticket de Servicio
            </h1>
            <p className="text-xs text-muted-foreground">
              Imprime el ticket físico para el parabrisas del auto o registro del cliente.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/45 border border-border px-3.5 py-1.5 rounded-xl h-10 select-none">
            <Switch
              id="hide-prices-toggle"
              checked={hidePrices}
              onCheckedChange={setHidePrices}
              className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40"
            />
            <Label htmlFor="hide-prices-toggle" className="text-xs font-bold text-foreground cursor-pointer select-none">
              Ocultar precios
            </Label>
          </div>
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-10 rounded-xl gap-2 cursor-pointer px-3.5 font-bold"
            title="Enviar comprobante por WhatsApp (Tecla: W)"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
            <kbd className="hidden sm:inline px-1.5 py-0.2 rounded bg-emerald-500/10 text-[9px] font-mono font-bold">
              W
            </kbd>
          </Button>
          <Button
            onClick={() => window.open(`/api/pdf/ticket/${orden.id}${hidePrices ? "?mode=work" : ""}`, "_blank")}
            variant="outline"
            className="border-border hover:bg-muted text-foreground h-10 rounded-lg gap-2 cursor-pointer px-4"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-secondary hover:bg-sky-400 text-slate-950 font-black gap-2 cursor-pointer h-10 rounded-xl shadow-md shadow-secondary/20 px-5"
            title="Imprimir ticket térmico (Tecla: P)"
          >
            <Printer className="size-4 text-slate-950" />
            <span>{hidePrices ? "Imprimir Trabajo" : "Imprimir Ticket"}</span>
            <kbd className="hidden sm:inline px-1.5 py-0.2 rounded bg-slate-950/20 text-slate-950 text-[10px] font-mono font-black">
              P
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Ticket Preview & Control Panel ──────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 p-6 bg-card rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] print:bg-transparent print:border-none print:shadow-none print:p-0 print:gap-0">
        {/* Ticket Preview */}
        <TicketPreview
          orden={orden}
          sucursal={sucursal}
          hidePrices={hidePrices}
        />

        {/* SUNAT Control Panel (Solo visible en pantalla, nunca en impresión) */}
        {(orden.estado === "cobrado" || orden.estado === "completado") && (
          <div className="print:hidden w-full max-w-md shrink-0" data-print="hidden">
            <SunatControlPanel
              tipo={tipo}
              serie={serie}
              numero={numero}
              isPending={isPending}
              onTipoChange={handleTipoChange}
              onSerieChange={handleSerieChange}
              onNumeroChange={(v) => setNumero(v.replace(/\D/g, "").slice(0, 8))}
              onSave={handleSaveComprobante}
            />
          </div>
        )}
      </div>
    </div>
  );
}
