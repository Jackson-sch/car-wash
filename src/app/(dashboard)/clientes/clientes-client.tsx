"use client";

import { useState, useTransition } from "react";
import { Users, Search, Gift, Car, UserPlus, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryState, parseAsInteger } from "nuqs";
import { createCliente, getClienteHistorial, ajustarPuntosCliente } from "@/lib/actions/clientes";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/shared/StatsCard";
import { ClientesTable, Cliente } from "./components/ClientesTable";
import { ClienteDrawer, Vehiculo, PuntosLog, OrdenVisita } from "./components/ClienteDrawer";
import { AjustarPuntosModal } from "./components/AjustarPuntosModal";
import { CrearClienteModal } from "./components/CrearClienteModal";
import { formatCurrency } from "@/lib/formats";

interface ClientesClientProps {
  initialClientes: Cliente[];
}

export function ClientesClient({ initialClientes }: ClientesClientProps) {
  const [clientesList, setClientesList] = useState<Cliente[]>(initialClientes);
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [isPending, startTransition] = useTransition();

  // Estados del modal de agregar cliente
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Estados del modal de Ficha de Cliente
  const [isFichaOpen, setIsFichaOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [fichaData, setFichaData] = useState<{
    vehiculos: Vehiculo[];
    puntos: PuntosLog[];
    ordenes: OrdenVisita[];
  } | null>(null);

  // Estados del modal de Ajustar Puntos
  const [isAjusteOpen, setIsAjusteOpen] = useState(false);

  // Guardar nuevo cliente manual
  const handleSaveCliente = async (data: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    tipoDoc: string;
    nroDoc: string;
    notas: string;
  }) => {
    startTransition(async () => {
      const res = await createCliente({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        email: data.email,
        tipoDoc: (data.tipoDoc as any) || null,
        nroDoc: data.nroDoc || null,
        notas: data.notas,
      });

      if (res.success && res.data) {
        toast.success("Cliente registrado con éxito");
        const newCli: Cliente = {
          ...res.data,
          totalVehiculos: 0,
          totalPuntos: 0,
        } as Cliente;
        setClientesList((prev) => [...prev, newCli]);
        setIsCreateOpen(false);
      } else {
        toast.error(res.error || "Error al crear cliente");
      }
    });
  };

  // Cargar Ficha/Perfil de Cliente
  const handleOpenFicha = async (cli: Cliente) => {
    setSelectedCliente(cli);
    setFichaData(null);
    setIsFichaOpen(true);

    const res = await getClienteHistorial(cli.id);
    if (res) {
      setFichaData(res);
    } else {
      toast.error("Error al cargar la ficha del cliente");
      setIsFichaOpen(false);
    }
  };

  // Abrir modal ajuste puntos
  const handleOpenAjuste = (cli: Cliente) => {
    setSelectedCliente(cli);
    setIsAjusteOpen(true);
  };

  // Guardar ajuste de puntos
  const handleSaveAjuste = async (
    tipo: "ganado" | "canjeado" | "ajuste",
    puntos: number,
    descripcion: string
  ) => {
    if (!selectedCliente) return;

    const factor = tipo === "canjeado" ? -1 : 1;
    const puntosAjustados = puntos * factor;

    startTransition(async () => {
      const res = await ajustarPuntosCliente({
        clienteId: selectedCliente.id,
        puntos: puntosAjustados,
        tipo,
        descripcion: descripcion || "Ajuste manual de administrador",
      });

      if (res.success) {
        toast.success("Puntos actualizados con éxito");
        setClientesList((prev) =>
          prev.map((c) =>
            c.id === selectedCliente.id
              ? { ...c, totalPuntos: Math.max(0, c.totalPuntos + puntosAjustados) }
              : c
          )
        );
        setIsAjusteOpen(false);
      } else {
        toast.error(res.error || "Ocurrió un error");
      }
    });
  };

  // Filtrado
  const filteredClientes = clientesList.filter((c) => {
    const query = (searchQuery || "").toLowerCase();
    return (
      c.nombre.toLowerCase().includes(query) ||
      (c.apellido && c.apellido.toLowerCase().includes(query)) ||
      (c.telefono && c.telefono.includes(query)) ||
      (c.nroDoc && c.nroDoc.includes(query))
    );
  });

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedClientes = filteredClientes.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // KPIs
  const totalClientes = clientesList.length;
  const totalCirculationPoints = clientesList.reduce((acc, curr) => acc + curr.totalPuntos, 0);
  const totalVehiculosRegistrados = clientesList.reduce((acc, curr) => acc + curr.totalVehiculos, 0);

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-secondary" />
            Directorio de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de clientes de autolavado, historial de visitas y programa de fidelidad de puntos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <UserPlus className="size-4.5" />
            Registrar Cliente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total de Clientes"
          value={totalClientes}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label="Vehículos Asociados"
          value={totalVehiculosRegistrados}
          icon={<Car className="h-5 w-5" />}
          iconColor="text-blue-500"
        />
        <StatsCard
          label="Puntos Activos"
          value={`${totalCirculationPoints} pts`}
          icon={<Gift className="h-5 w-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-600"
        />
        <Card className="p-6 border-amber-200 bg-linear-to-br from-amber-500/3 to-transparent shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-amber-300 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Award className="h-24 w-24 text-amber-500" />
          </div>
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Programa de Puntos
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Fidelización automática para clientes. Acumula y canjea en cada servicio de autolavado.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-background border border-muted rounded-lg p-2 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acumulación</span>
                <span className="text-xs font-extrabold mt-0.5">{formatCurrency(10)} = 1 pt</span>
              </div>
              <div className="bg-background border border-muted rounded-lg p-2 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Canje / Descuento</span>
                <span className="text-xs font-extrabold text-amber-600 mt-0.5">1 pt = {formatCurrency(0.20)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-9 bg-card border-zinc-300 hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
          />

        </div>
      </div>


      {/* Clientes Table Extracted Component */}
      <ClientesTable
        clientes={paginatedClientes}
        onViewDetails={handleOpenFicha}
        onOpenAjuste={handleOpenAjuste}
        activePage={activePage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredClientes.length}
        itemsPerPage={itemsPerPage}
      />


      {/* Drawer Ficha Extracted Component */}
      <ClienteDrawer
        isOpen={isFichaOpen}
        onClose={() => setIsFichaOpen(false)}
        cliente={selectedCliente}
        fichaData={fichaData}
      />

      {/* Ajuste Puntos Extracted Component */}
      {selectedCliente && (
        <AjustarPuntosModal
          isOpen={isAjusteOpen}
          onClose={() => setIsAjusteOpen(false)}
          cliente={selectedCliente}
          isPending={isPending}
          onSave={handleSaveAjuste}
        />
      )}

      {/* Crear Cliente Extracted Component */}
      <CrearClienteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isPending={isPending}
        onSave={handleSaveCliente}
      />
    </div>
  );
}
