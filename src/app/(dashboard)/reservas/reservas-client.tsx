"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  type ReservaItem,
  type CrearReservaInput,
  getReservasDelDia,
  crearReservaAction,
  cambiarEstadoReservaAction,
} from "@/lib/actions/reservas";

import { ReservasHeader } from "./components/ReservasHeader";
import { ReservasKpis } from "./components/ReservasKpis";
import { ReservasToolbar } from "./components/ReservasToolbar";
import { ReservaCard } from "./components/ReservaCard";
import { BahiasView } from "./components/BahiasView";
import { NuevaCitaModal } from "./components/NuevaCitaModal";

interface ServicioOpcion {
  id: string;
  nombre: string;
  precio: string;
  duracionMin: number | null;
}

interface ReservasClientProps {
  initialReservas: ReservaItem[];
  serviciosDisponibles: ServicioOpcion[];
}

export function ReservasClient({
  initialReservas,
  serviciosDisponibles,
}: ReservasClientProps) {
  const [reservas, setReservas] = useState<ReservaItem[]>(initialReservas);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]!);
  const [isPending, startTransition] = useTransition();

  // Filtros, búsqueda y modo de visualización
  const [statusFilter, setStatusFilter] = useState<"todas" | "pendiente" | "en_proceso" | "completado">("todas");
  const [viewMode, setViewMode] = useState<"bahias" | "timeline" | "lista">("bahias");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal nueva cita
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CrearReservaInput>({
    clienteNombre: "",
    clienteApellido: "",
    clienteTelefono: "",
    placa: "",
    vehiculoTipo: "sedan",
    vehiculoMarca: "",
    vehiculoModelo: "",
    servicioId: "",
    fecha: new Date().toISOString().split("T")[0]!,
    hora: "10:00",
    prioridad: 0,
    notas: "",
  });

  // Navegación de fechas
  const handleDateChange = (newDate: string) => {
    setFecha(newDate);
    startTransition(async () => {
      const res = await getReservasDelDia(newDate);
      if (res.success) {
        setReservas(res.data);
      }
    });
  };

  const handleDayOffset = (offset: number) => {
    const current = new Date(`${fecha}T12:00:00`);
    current.setDate(current.getDate() + offset);
    const formatted = current.toISOString().split("T")[0]!;
    handleDateChange(formatted);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split("T")[0]!;
    handleDateChange(today);
  };

  // KPIs del día
  const totalCitas = reservas.length;
  const enEspera = reservas.filter((r) => r.estado === "pendiente").length;
  const enBahia = reservas.filter((r) => r.estado === "en_proceso").length;
  const completadas = reservas.filter(
    (r) => r.estado === "completado" || r.estado === "cobrado"
  ).length;

  // Filtrado compuesto (estado + buscador de placa/cliente)
  const filteredReservas = useMemo(() => {
    let result = reservas;

    if (statusFilter === "completado") {
      result = result.filter(
        (r) => r.estado === "completado" || r.estado === "cobrado"
      );
    } else if (statusFilter !== "todas") {
      result = result.filter((r) => r.estado === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const placa = (r.placa || "").toLowerCase();
        const cliente = `${r.clienteNombre || ""} ${r.clienteApellido || ""}`.toLowerCase();
        const ticket = (r.nroTicket || "").toLowerCase();
        return placa.includes(query) || cliente.includes(query) || ticket.includes(query);
      });
    }

    return result;
  }, [reservas, statusFilter, searchQuery]);

  // Agrupación en bloques horarios para Timeline
  const bloquesHorarios = useMemo(() => {
    const getHour = (r: ReservaItem) => {
      if (!r.createdAt) return 10;
      return new Date(r.createdAt).getHours();
    };

    return [
      {
        id: "manana",
        titulo: "Turno Mañana",
        rango: "08:00 AM - 12:00 PM",
        icon: Clock,
        items: filteredReservas.filter((r) => {
          const h = getHour(r);
          return h >= 6 && h < 12;
        }),
      },
      {
        id: "tarde",
        titulo: "Turno Tarde",
        rango: "12:00 PM - 04:00 PM",
        icon: Sparkles,
        items: filteredReservas.filter((r) => {
          const h = getHour(r);
          return h >= 12 && h < 16;
        }),
      },
      {
        id: "noche",
        titulo: "Turno Tarde / Cierre",
        rango: "04:00 PM - 08:00 PM",
        icon: Clock,
        items: filteredReservas.filter((r) => {
          const h = getHour(r);
          return h >= 16;
        }),
      },
    ];
  }, [filteredReservas]);

  // Acciones sobre citas
  const handleCambiarEstado = async (id: string, nuevoEstado: ReservaItem["estado"]) => {
    startTransition(async () => {
      const res = await cambiarEstadoReservaAction(id, nuevoEstado);
      if (res.success) {
        setReservas((prev) =>
          prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
        );
        toast.success(
          nuevoEstado === "en_proceso"
            ? "Vehículo ingresado a Bahía de lavado"
            : nuevoEstado === "completado"
            ? "Lavado finalizado correctamente"
            : "Estado actualizado"
        );
      } else {
        toast.error(res.error || "Ocurrió un error al actualizar");
      }
    });
  };

  // Guardar nueva cita
  const handleCrearCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim() || !formData.clienteNombre.trim()) {
      toast.error("Por favor completa la placa y el nombre del cliente.");
      return;
    }

    startTransition(async () => {
      const res = await crearReservaAction({
        ...formData,
        fecha,
      });

      if (res.success && res.data) {
        toast.success("¡Cita agendada con éxito!", {
          description: `Placa ${res.data.placa} programada para las ${formData.hora}`,
        });
        setReservas((prev) => [res.data as ReservaItem, ...prev]);
        setModalOpen(false);
        setFormData({
          clienteNombre: "",
          clienteApellido: "",
          clienteTelefono: "",
          placa: "",
          vehiculoTipo: "sedan",
          vehiculoMarca: "",
          vehiculoModelo: "",
          servicioId: "",
          fecha,
          hora: "10:00",
          prioridad: 0,
          notas: "",
        });
      } else {
        toast.error(res.error || "Error al registrar la cita");
      }
    });
  };

  const isToday = fecha === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 sm:space-y-8 text-foreground pb-12">
      {/* Header con Popover de Fecha y Acción Principal */}
      <ReservasHeader
        fecha={fecha}
        onDateChange={handleDateChange}
        onDayOffset={handleDayOffset}
        onSetToday={handleSetToday}
        onOpenNuevaCita={() => {
          setFormData((prev) => ({ ...prev, fecha }));
          setModalOpen(true);
        }}
      />

      {/* Bento KPI Cards */}
      <ReservasKpis
        totalCitas={totalCitas}
        enBahia={enBahia}
        enEspera={enEspera}
        completadas={completadas}
        isToday={isToday}
        fecha={fecha}
      />

      {/* Toolbar: Filtros de Estado + Búsqueda + Modos de Vista */}
      <ReservasToolbar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        counts={{
          total: totalCitas,
          pendiente: enEspera,
          enProceso: enBahia,
          completado: completadas,
        }}
      />

      {/* Contenido según Modo de Vista */}
      {filteredReservas.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <CalendarIcon className="size-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">No hay citas registradas</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {isToday
              ? "No hay vehículos en la agenda para el día de hoy. Puedes agendar una cita rápidamente."
              : `No se encontraron citas agendadas para la fecha seleccionada.`}
          </p>
          <Button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, fecha }));
              setModalOpen(true);
            }}
            className="mt-2 text-xs font-bold h-9 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" />
            <span>Agendar Cita</span>
          </Button>
        </Card>
      ) : viewMode === "bahias" ? (
        /* Vista de Bahías en Vivo */
        <BahiasView
          reservas={filteredReservas}
          onCambiarEstado={handleCambiarEstado}
          isPending={isPending}
          onOpenNuevaCita={() => {
            setFormData((prev) => ({ ...prev, fecha }));
            setModalOpen(true);
          }}
        />
      ) : viewMode === "timeline" ? (
        /* Vista por Turnos y Horarios */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {bloquesHorarios.map((bloque) => {
            const Icon = bloque.icon;
            return (
              <div
                key={bloque.id}
                className="rounded-3xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                        {bloque.titulo}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {bloque.rango}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-bold border-border bg-muted/40"
                  >
                    {bloque.items.length} {bloque.items.length === 1 ? "Auto" : "Autos"}
                  </Badge>
                </div>

                <div className="space-y-3 min-h-[160px]">
                  {bloque.items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground/60 border border-dashed border-border/60 rounded-2xl">
                      Sin autos en este horario
                    </div>
                  ) : (
                    bloque.items.map((r) => (
                      <ReservaCard
                        key={r.id}
                        reserva={r}
                        onCambiarEstado={handleCambiarEstado}
                        isPending={isPending}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Lista Directa */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservas.map((r) => (
            <ReservaCard
              key={r.id}
              reserva={r}
              onCambiarEstado={handleCambiarEstado}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Modal Nueva Cita */}
      <NuevaCitaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCrearCita}
        isPending={isPending}
        serviciosDisponibles={serviciosDisponibles}
      />
    </div>
  );
}
