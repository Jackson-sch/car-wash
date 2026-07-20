"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Printer,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registrarComprobanteSunat } from "@/lib/actions/ordenes";
import { TicketPreview } from "./components/TicketPreview";
import { SunatControlPanel } from "./components/SunatControlPanel";

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
  // Cada ticket tiene su propia URL (/ordenes/[id]/ticket), por lo que Next.js
  // monta/desmonta el componente al navegar entre tickets, dando estado fresco.
  // Esto elimina la necesidad de un useEffect para sincronizar props → estado.
  const [tipo, setTipo] = useState<"boleta" | "factura" | "ninguno">(
    (orden.comprobanteTipo as "boleta" | "factura") || "ninguno",
  );
  const [serie, setSerie] = useState(orden.comprobanteSerie || "");
  const [numero, setNumero] = useState(orden.comprobanteNumero || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

  return (
    <div className="space-y-8">

      {/* ── Header Actions ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
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
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 p-6 bg-card rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] print:bg-transparent print:border-none print:shadow-none print:p-0 print:gap-0">
        {/* Ticket Preview */}
      <TicketPreview
        orden={orden}
        sucursal={sucursal}
        hidePrices={hidePrices}
      />

      {/* SUNAT Control Panel */}
      {(orden.estado === "cobrado" || orden.estado === "completado") && (
        <SunatControlPanel
          tipo={tipo}
          serie={serie}
          numero={numero}
          isPending={isPending}
          onTipoChange={handleTipoChange}
          onSerieChange={(v) => setSerie(v.toUpperCase().slice(0, 4))}
          onNumeroChange={(v) => setNumero(v.replace(/\D/g, "").slice(0, 8))}
          onSave={handleSaveComprobante}
        />
      )}
      </div>
    </div>
  );
}
