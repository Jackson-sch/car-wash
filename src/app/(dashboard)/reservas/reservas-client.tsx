"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Car,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
  User,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formats";
import { toast } from "sonner";
import Link from "next/link";
import {
  type ReservaItem,
  type CrearReservaInput,
  getReservasDelDia,
  crearReservaAction,
  cambiarEstadoReservaAction,
} from "@/lib/actions/reservas";

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

const VEHICULOS_TYPES = [
  { id: "sedan", label: "Sedán" },
  { id: "suv", label: "SUV" },
  { id: "pickup", label: "Pick-up / Camioneta" },
  { id: "moto", label: "Moto" },
  { id: "camion", label: "Camión" },
  { id: "furgon", label: "Furgón / Van" },
  { id: "otro", label: "Otro" },
];

export function ReservasClient({
  initialReservas,
  serviciosDisponibles,
}: ReservasClientProps) {
  const [reservas, setReservas] = useState<ReservaItem[]>(initialReservas);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [isPending, startTransition] = useTransition();

  // Filtros y vista
  const [statusFilter, setStatusFilter] = useState<"todas" | "pendiente" | "en_proceso" | "completado">("todas");
  const [viewMode, setViewMode] = useState<"timeline" | "lista">("timeline");

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
    fecha: new Date().toISOString().split("T")[0],
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
    const formatted = current.toISOString().split("T")[0];
    handleDateChange(formatted);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split("T")[0];
    handleDateChange(today);
  };

  // KPIs del día
  const totalCitas = reservas.length;
  const enEspera = reservas.filter((r) => r.estado === "pendiente").length;
  const enBahia = reservas.filter((r) => r.estado === "en_proceso").length;
  const completadas = reservas.filter((r) => r.estado === "completado" || r.estado === "cobrado").length;

  // Filtrado de citas
  const filteredReservas = useMemo(() => {
    if (statusFilter === "todas") return reservas;
    if (statusFilter === "completado") {
      return reservas.filter((r) => r.estado === "completado" || r.estado === "cobrado");
    }
    return reservas.filter((r) => r.estado === statusFilter);
  }, [reservas, statusFilter]);

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

  // Acciones en vivo sobre citas
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
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground pb-12">
      {/* ── Header Principal con Navegación de Fecha ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarIcon className="size-7 text-secondary" />
            Agenda & Reservas de Lavado
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planificación de turnos por bahía, control de flujo y citas previas de clientes.
          </p>
        </div>

        {/* Date Selector & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navegador de Fecha */}
          <div className="flex items-center gap-1 bg-card/70 border border-border rounded-xl p-1 shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDayOffset(-1)}
              className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
              title="Día anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <button
              type="button"
              onClick={handleSetToday}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                isToday
                  ? "bg-secondary/15 text-secondary border border-secondary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hoy
            </button>

            <Input
              type="date"
              value={fecha}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-36 h-8 text-xs font-bold border-0 bg-transparent focus-visible:ring-0 cursor-pointer text-foreground"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDayOffset(1)}
              className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
              title="Día siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, fecha }));
              setModalOpen(true);
            }}
            className="h-10 px-4 text-xs sm:text-sm font-bold gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
          >
            <Plus className="size-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* ── Bento KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Citas */}
        <Card className="p-4 sm:p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Citas del Día
            </span>
            <span className="text-2xl sm:text-3xl font-black text-foreground mt-0.5 block">
              {totalCitas}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isToday ? "Agenda para hoy" : `Fecha: ${fecha}`}
            </span>
          </div>
          <div className="size-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <CalendarIcon className="size-5" />
          </div>
        </Card>

        {/* En Bahía */}
        <Card className="p-4 sm:p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
              En Bahía / Lavando
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5 block">
              {enBahia}
            </span>
            <span className="text-[10px] text-muted-foreground">Ocupando puesto</span>
          </div>
          <div className="size-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <Sparkles className="size-5 animate-pulse" />
          </div>
        </Card>

        {/* En Espera */}
        <Card className="p-4 sm:p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Por Atender
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
              {enEspera}
            </span>
            <span className="text-[10px] text-muted-foreground">En cola de espera</span>
          </div>
          <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Clock className="size-5" />
          </div>
        </Card>

        {/* Completadas */}
        <Card className="p-4 sm:p-5 border-border bg-card/60 backdrop-blur-sm rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Finalizadas
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {completadas}
            </span>
            <span className="text-[10px] text-muted-foreground">Listas o cobradas</span>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="size-5" />
          </div>
        </Card>
      </div>

      {/* ── Toolbar de Filtros y Modo de Vista ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card/70 border border-border rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("todas")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "todas"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({totalCitas})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pendiente")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "pendiente"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            En Espera ({enEspera})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("en_proceso")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "en_proceso"
                ? "bg-cyan-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            En Bahía ({enBahia})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completado")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              statusFilter === "completado"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completadas ({completadas})
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-card/70 border border-border p-1 rounded-xl shadow-xs shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              viewMode === "timeline"
                ? "bg-secondary/15 text-secondary font-black border border-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Por Turnos
          </button>
          <button
            type="button"
            onClick={() => setViewMode("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              viewMode === "lista"
                ? "bg-secondary/15 text-secondary font-black border border-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-3.5" />
            Lista
          </button>
        </div>
      </div>

      {/* ── Contenido Principal: Timeline vs Lista ── */}
      {filteredReservas.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <CalendarIcon className="size-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">No hay citas registradas</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {isToday
              ? "No hay vehículos en la agenda para el día de hoy. Puedes agendar una cita rápidamente."
              : `No se encontraron citas agendadas para la fecha ${fecha}.`}
          </p>
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-2 text-xs font-bold h-9 rounded-xl bg-secondary text-secondary-foreground cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" />
            Agendar Primera Cita
          </Button>
        </Card>
      ) : viewMode === "timeline" ? (
        /* Vista Timeline de 3 Bloques Horarios */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {bloquesHorarios.map((bloque) => {
            const Icon = bloque.icon;
            return (
              <div
                key={bloque.id}
                className="rounded-3xl border border-border/80 bg-card/50 backdrop-blur-md p-4 sm:p-5 space-y-4 shadow-sm"
              >
                {/* Header del Bloque */}
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
                    className="text-[10px] font-black border-border bg-muted/30"
                  >
                    {bloque.items.length} {bloque.items.length === 1 ? "Auto" : "Autos"}
                  </Badge>
                </div>

                {/* Items del Bloque */}
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

      {/* ── Modal Nueva Reserva ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
                  <CalendarIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground leading-tight">
                    Agendar Nueva Cita
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Programa el ingreso de un vehículo a la bahía de lavado.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCrearCita} className="space-y-4">
              {/* Cliente: Nombre y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Nombre del Cliente *
                  </Label>
                  <Input
                    placeholder="Ej. Juan Pérez"
                    value={formData.clienteNombre}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteNombre: e.target.value })
                    }
                    required
                    className="text-xs h-9 rounded-xl bg-card border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Teléfono Celular
                  </Label>
                  <Input
                    type="tel"
                    placeholder="987654321"
                    value={formData.clienteTelefono || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteTelefono: e.target.value })
                    }
                    className="text-xs h-9 rounded-xl font-mono bg-card border-border text-foreground"
                  />
                </div>
              </div>

              {/* Vehículo: Placa y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Número de Placa *
                  </Label>
                  <Input
                    placeholder="ABC-123"
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        placa: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    className="text-xs h-9 uppercase font-mono tracking-widest font-extrabold rounded-xl bg-card border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Tipo de Vehículo
                  </Label>
                  <Select
                    value={formData.vehiculoTipo || "sedan"}
                    onValueChange={(val) =>
                      setFormData({ ...formData, vehiculoTipo: val || "sedan" })
                    }
                  >
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-card border-border text-foreground">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {VEHICULOS_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Servicio y Horario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Servicio a Realizar
                  </Label>
                  <Select
                    value={formData.servicioId || "none"}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        servicioId: val === "none" ? "" : val || "",
                      })
                    }
                  >
                    <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-card border-border text-foreground">
                      <SelectValue placeholder="Elegir servicio..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="none">Por definir en bahía</SelectItem>
                      {serviciosDisponibles.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nombre} ({formatCurrency(parseFloat(s.precio) || 0)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">
                    Hora Programada *
                  </Label>
                  <Input
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    required
                    className="text-xs h-9 rounded-xl bg-card border-border text-foreground font-mono"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">
                  Notas u Observaciones del Auto
                </Label>
                <Input
                  placeholder="Ej. Cuidado con abolladura previa en puerta derecha..."
                  value={formData.notas || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  className="text-xs h-9 rounded-xl bg-card border-border text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold h-9 rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="text-xs font-extrabold h-9 px-5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
                >
                  {isPending ? "Agendando..." : "Confirmar y Guardar Cita"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de Cita Individual ──────────────────────────────────
function ReservaCard({
  reserva: r,
  onCambiarEstado,
  isPending,
}: {
  reserva: ReservaItem;
  onCambiarEstado: (id: string, nuevoEstado: ReservaItem["estado"]) => void;
  isPending: boolean;
}) {
  const formattedTime = useMemo(() => {
    if (!r.createdAt) return "--:--";
    const d = new Date(r.createdAt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [r.createdAt]);

  const cleanPhone = (r.clienteTelefono || "").replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(
        `Hola ${r.clienteNombre || ""}, te recordamos tu cita de lavado para el vehículo ${r.placa || ""} en WashMaster Pro.`
      )}`
    : null;

  return (
    <Card className="p-4 border-border/80 bg-card hover:border-secondary/50 rounded-2xl shadow-xs transition-all space-y-3 relative overflow-hidden group">
      {/* Barra superior: Placa y Hora */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-secondary/15 text-secondary border border-secondary/30 tracking-wider">
            {r.placa || "SIN PLACA"}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="size-3 text-secondary" />
            {formattedTime}
          </span>
        </div>

        {/* Badge de Estado */}
        {r.estado === "pendiente" && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            En Espera
          </span>
        )}
        {r.estado === "en_proceso" && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-cyan-500 animate-ping" />
            En Bahía
          </span>
        )}
        {r.estado === "completado" && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            ✓ Finalizado
          </span>
        )}
        {r.estado === "cobrado" && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Cobrado
          </span>
        )}
      </div>

      {/* Datos del Cliente y Vehículo */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground truncate max-w-[170px]">
            {r.clienteNombre} {r.clienteApellido || ""}
          </span>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 text-[11px] font-bold"
              title="Avisar por WhatsApp"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground truncate">
          {r.vehiculoMarca || ""} {r.vehiculoModelo || ""}
          {r.vehiculoTipo ? ` • ${r.vehiculoTipo}` : ""}
        </p>

        {r.notas && (
          <p className="text-[10px] text-muted-foreground/80 italic line-clamp-1 bg-muted/30 px-2 py-0.5 rounded-md mt-1">
            {r.notas.replace("[CITA AGENDADA]", "").trim() || "Cita agendada"}
          </p>
        )}
      </div>

      {/* Footer de Tarjeta y Botones de Acción */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            Ticket: {r.nroTicket || "S/N"}
          </span>
          {r.total && parseFloat(r.total) > 0 && (
            <span className="text-xs font-black text-foreground">
              {formatCurrency(parseFloat(r.total) || 0)}
            </span>
          )}
        </div>

        {/* Acciones de Flujo */}
        <div className="flex items-center gap-1.5">
          {r.estado === "pendiente" && (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => onCambiarEstado(r.id, "en_proceso")}
              className="h-8 px-3 text-[11px] font-extrabold gap-1 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer shadow-xs"
            >
              <Play className="size-3 fill-current" />
              A Bahía
            </Button>
          )}

          {r.estado === "en_proceso" && (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => onCambiarEstado(r.id, "completado")}
              className="h-8 px-3 text-[11px] font-extrabold gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              Finalizar
            </Button>
          )}

          {r.estado === "completado" && (
            <Link href={`/ordenes`} passHref>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-[11px] font-bold rounded-xl cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Cobrar
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
