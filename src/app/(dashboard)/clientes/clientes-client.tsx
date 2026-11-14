"use client";

import { useState, useTransition, useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { createCliente, getClienteHistorial, ajustarPuntosCliente } from "@/lib/actions/clientes";
import { toast } from "sonner";

import type { Cliente } from "./components/ClientesTable";
import { ClientesTable } from "./components/ClientesTable";
import { ClientesKpiCards } from "./components/ClientesKpiCards";
import { ClientesHeader } from "./components/ClientesHeader";
import { ClientesToolbar, type ClienteTierFilter } from "./components/ClientesToolbar";
import type { Vehiculo, PuntosLog, OrdenVisita } from "./components/ClienteDrawer";
import { ClienteDrawer } from "./components/ClienteDrawer";
import { AjustarPuntosModal } from "./components/AjustarPuntosModal";
import { CrearClienteModal } from "./components/CrearClienteModal";

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
  const [tierFilter, setTierFilter] = useState<ClienteTierFilter>("todos");
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

  // Conteos por Tier de Lealtad
  const counts = useMemo(() => {
    let vip = 0;
    let silver = 0;
    let conAutos = 0;
    let sinPuntos = 0;

    clientesList.forEach((c) => {
      const pts = c.totalPuntos || 0;
      if (pts >= 100) vip++;
      else if (pts >= 50) silver++;
      else if (pts === 0) sinPuntos++;

      if (c.totalVehiculos > 0) conAutos++;
    });

    return {
      total: clientesList.length,
      vip,
      silver,
      conAutos,
      sinPuntos,
    };
  }, [clientesList]);

  // Filtrado compuesto (buscador + tier)
  const filteredClientes = useMemo(() => {
    return clientesList.filter((c) => {
      // 1. Buscador
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = c.nombre.toLowerCase().includes(query);
        const matchLast = (c.apellido || "").toLowerCase().includes(query);
        const matchPhone = (c.telefono || "").includes(query);
        const matchDoc = (c.nroDoc || "").includes(query);
        if (!matchName && !matchLast && !matchPhone && !matchDoc) return false;
      }

      // 2. Filtro por Tier
      const pts = c.totalPuntos || 0;
      if (tierFilter === "vip") return pts >= 100;
      if (tierFilter === "silver") return pts >= 50 && pts < 100;
      if (tierFilter === "con_autos") return c.totalVehiculos > 0;
      if (tierFilter === "sin_puntos") return pts === 0;

      return true;
    });
  }, [clientesList, searchQuery, tierFilter]);

  const hasActiveFilters = Boolean(searchQuery.trim()) || tierFilter !== "todos";

  const handleClearFilters = () => {
    setSearchQuery("");
    setTierFilter("todos");
  };

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
        tipoDoc: (data.tipoDoc as "DNI" | "RUC" | "CE" | "PASAPORTE" | null) || null,
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
        setClientesList((prev) => [newCli, ...prev]);
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

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedClientes = filteredClientes.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="space-y-6 sm:space-y-8 text-foreground pb-12">
      {/* 1. Header con Exportación a Excel y Registrar Cliente */}
      <ClientesHeader
        onOpenCreate={() => setIsCreateOpen(true)}
        totalClientes={clientesList.length}
      />

      {/* 2. Stats Cards de Clientes y Fidelización */}
      <ClientesKpiCards clientesList={clientesList} />

      {/* 3. Toolbar con Píldoras de Fidelización y Buscador Universal */}
      <ClientesToolbar
        searchQuery={searchQuery || ""}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(null);
        }}
        tierFilter={tierFilter}
        onTierFilterChange={(tier) => {
          setTierFilter(tier);
          setPage(null);
        }}
        counts={counts}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Tabla de Clientes con WhatsApp a 1 clic, avatares y niveles */}
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

      {/* 5. Drawer de Ficha de Cliente */}
      <ClienteDrawer
        isOpen={isFichaOpen}
        onClose={() => setIsFichaOpen(false)}
        cliente={selectedCliente}
        fichaData={fichaData}
      />

      {/* 6. Modal de Ajuste de Puntos */}
      {selectedCliente && (
        <AjustarPuntosModal
          isOpen={isAjusteOpen}
          onClose={() => setIsAjusteOpen(false)}
          cliente={selectedCliente}
          isPending={isPending}
          onSave={handleSaveAjuste}
        />
      )}

      {/* 7. Modal de Registrar Cliente */}
      <CrearClienteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isPending={isPending}
        onSave={handleSaveCliente}
      />
    </div>
  );
}
