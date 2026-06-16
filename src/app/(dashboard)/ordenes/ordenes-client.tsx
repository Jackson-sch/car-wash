"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Search, Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { updateOrdenEstado, asignarLavadorAOrden } from "@/lib/actions/ordenes";
import { cobrarOrden } from "@/lib/actions/caja";
import { toast } from "sonner";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { OrdenesKpiCards } from "./components/OrdenesKpiCards";
import { StaffAvailabilityCard } from "./components/StaffAvailabilityCard";
import { OperationalFlowChart } from "./components/OperationalFlowChart";
import { OrdenesTable, Orden, Lavador } from "./components/OrdenesTable";
import { OrdenesBoard } from "./components/OrdenesBoard";
import { CobrarModal, PaymentMethod } from "./components/CobrarModal";

interface OrdenesClientProps {
  initialOrdenes: Orden[];
  lavadores: Lavador[];
}

export function OrdenesClient({ initialOrdenes, lavadores }: OrdenesClientProps) {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>(initialOrdenes);
  
  // nuqs States
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [activeFilter, setActiveFilter] = useQueryState("status", {
    defaultValue: "todos",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsString.withDefault("patio").withOptions({ shallow: true, history: "replace" })
  );

  const [isPending, startTransition] = useTransition();

  // Estados para cobro de orden
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingOrden, setPayingOrden] = useState<Orden | null>(null);

  // Cambiar estado de orden
  const handleStatusChange = async (id: string, nuevoEstado: Orden["estado"]) => {
    if (nuevoEstado === "cobrado") {
      const ord = ordenes.find((o) => o.id === id);
      if (ord) {
        setPayingOrden(ord);
        setIsPayModalOpen(true);
      }
      return;
    }

    startTransition(async () => {
      const res = await updateOrdenEstado(id, nuevoEstado);
      if (res.success && res.data) {
        toast.success(`Estado de orden actualizado a ${nuevoEstado}`);
        setOrdenes((prev) =>
          prev.map((o) => (o.id === id ? { ...o, estado: nuevoEstado } : o))
        );
      } else {
        toast.error(res.error || "Error al actualizar estado");
      }
    });
  };

  // Asignar lavador
  const handleAssignLavador = async (id: string, empleadoId: string | null) => {
    startTransition(async () => {
      const res = await asignarLavadorAOrden(id, empleadoId);
      if (res.success) {
        const lavador = lavadores.find((l) => l.id === empleadoId);
        toast.success(
          lavador
            ? `Lavador asignado: ${lavador.nombre}`
            : "Se removió la asignación del lavador"
        );
        setOrdenes((prev) =>
          prev.map((o) =>
            o.id === id
              ? {
                  ...o,
                  lavadorNombre: lavador?.nombre || null,
                  lavadorApellido: lavador?.apellido || null,
                }
              : o
          )
        );
      } else {
        toast.error(res.error || "Error al asignar lavador");
      }
    });
  };

  // Confirmar cobro
  const handleConfirmPay = async (metodo: PaymentMethod, referencia: string, monto?: string, cuponId?: string) => {
    if (!payingOrden) return;
    
    startTransition(async () => {
      const res = await cobrarOrden({
        ordenId: payingOrden.id,
        metodo,
        monto: monto || payingOrden.total || "0",
        referencia,
        cuponId,
      });

      if (res.success) {
        toast.success("Pago registrado correctamente en caja");
        setOrdenes((prev) =>
          prev.map((o) =>
            o.id === payingOrden.id ? { ...o, estado: "cobrado" } : o
          )
        );
        setIsPayModalOpen(false);
        // Redirigir directamente al ticket con el hash #print para abrir el diálogo de impresión
        router.push(`/ordenes/${payingOrden.id}/ticket#print`);
      } else {
        toast.error(res.error || "Ocurrió un error al procesar el pago");
      }
    });
  };

  // Filtrado de lista
  const filteredOrdenes = ordenes.filter((o) => {
    const term = (searchQuery || "").toLowerCase();
    const matchesSearch =
      (o.nroTicket && o.nroTicket.toLowerCase().includes(term)) ||
      o.placa.toLowerCase().includes(term) ||
      o.clienteNombre.toLowerCase().includes(term) ||
      (o.clienteApellido && o.clienteApellido.toLowerCase().includes(term)) ||
      (o.vehiculoMarca && o.vehiculoMarca.toLowerCase().includes(term));

    if (activeFilter === "todos") return matchesSearch;
    return matchesSearch && o.estado === activeFilter;
  });

  // Paginación (solo afecta a la tabla, el Kanban muestra todos los del filtro actual)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedOrdenes = filteredOrdenes.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-secondary" />
            Bandeja de Órdenes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitorea el progreso de lavado, asigna personal y gestiona cobros de ticket en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle Vista */}
          <div className="bg-background backdrop-blur-md p-1 rounded-lg border border-border flex items-center shadow-sm">
            <button
              onClick={() => setViewMode("patio")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "patio"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="size-4" />
              Patio
            </button>
            <button
              onClick={() => setViewMode("lista")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "lista"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <List className="size-4" />
              Lista
            </button>
          </div>

          <Link href="/ordenes/nueva" passHref>
            <Button variant="secondary" className="font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-4">
              <Plus className="size-4.5" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bento Grid (Stitch design) */}
      <OrdenesKpiCards ordenes={ordenes} />

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, ticket o cliente..."
              value={searchQuery || ""}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(null);
              }}
              className="pl-9 bg-card/60 backdrop-blur-md border-border hover:border-zinc-400 focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9 rounded-lg text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
            />
          </div>

          {/* Status Dropdown Selector - from Stitch design */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-card/45 border border-border hover:border-zinc-400 dark:hover:border-zinc-700 rounded-lg text-xs font-bold shadow-xs h-9">
            <span className="text-muted-foreground">Estado:</span>
            <select
              value={activeFilter || "todos"}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(null);
              }}
              className="bg-transparent border-none focus:ring-0 font-bold text-foreground py-0 pl-1 pr-6 cursor-pointer focus:outline-none"
            >
              <option value="todos" className="bg-card text-foreground font-bold">Todos</option>
              <option value="pendiente" className="bg-card text-foreground font-bold">En Espera</option>
              <option value="en_proceso" className="bg-card text-foreground font-bold">En Proceso</option>
              <option value="completado" className="bg-card text-foreground font-bold">Completados</option>
              <option value="cobrado" className="bg-card text-foreground font-bold">Cobrados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rendering views conditionally */}
      {viewMode === "patio" ? (
        <OrdenesBoard
          ordenes={filteredOrdenes}
          lavadores={lavadores}
          onStatusChange={handleStatusChange}
          onAssignLavador={handleAssignLavador}
          onEdit={(orden) => toast.info("Editar orden próximamente")}
        />
      ) : (
        <>
          <OrdenesTable
            ordenes={paginatedOrdenes}
            lavadores={lavadores}
            onStatusChange={handleStatusChange}
            onAssignLavador={handleAssignLavador}
          />
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Bottom Insights Section (Stitch gadgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1">
          <StaffAvailabilityCard lavadores={lavadores} ordenes={ordenes} />
        </div>
        <div className="lg:col-span-2">
          <OperationalFlowChart ordenes={ordenes} />
        </div>
      </div>

      {/* Pay Modal Extracted Component */}
      {payingOrden && (
        <CobrarModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          orden={payingOrden}
          isPending={isPending}
          onConfirm={handleConfirmPay}
        />
      )}
    </div>
  );
}
