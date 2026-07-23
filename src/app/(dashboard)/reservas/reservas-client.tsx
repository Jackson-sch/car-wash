"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Car, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReservaItem {
  id: string;
  nroTicket: string | null;
  placa: string | null;
  estado: string;
  createdAt: Date | null;
  total: string | null;
}

export function ReservasClient({ initialReservas }: { initialReservas: ReservaItem[] }) {
  const [reservas, setReservas] = useState<ReservaItem[]>(initialReservas);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const [clienteNombre, setClienteNombre] = useState("");
  const [placa, setPlaca] = useState("");
  const [hora, setHora] = useState("10:00");

  const handleCrearReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !clienteNombre) {
      toast.error("Por favor complete los datos obligatorios.");
      return;
    }

    const nuevaReserva: ReservaItem = {
      id: `res_${Date.now()}`,
      nroTicket: `RES-${Math.floor(100 + Math.random() * 900)}`,
      placa: placa.toUpperCase(),
      estado: "pendiente",
      createdAt: new Date(`${fecha}T${hora}:00`),
      total: "45.00",
    };

    setReservas([nuevaReserva, ...reservas]);
    setModalOpen(false);
    setClienteNombre("");
    setPlaca("");
    toast.success("Reserva agendada con éxito", {
      description: `Cita para la placa ${placa.toUpperCase()} a las ${hora}.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-secondary" />
            Agenda & Reservas de Lavado
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestión de citas programadas por bahía y control de afluencia de clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-40 h-9 text-xs font-bold"
          />
          <Button onClick={() => setModalOpen(true)} className="h-9 text-xs font-bold gap-1.5 rounded-lg bg-secondary text-secondary-foreground">
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Grid de Horarios de la Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["08:00 AM - 11:00 AM", "11:00 AM - 02:00 PM", "02:00 PM - 06:00 PM"].map((bloque, idx) => (
          <Card key={bloque} className="p-4 border-border bg-card space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Clock className="h-4 w-4 text-secondary" />
                Bloque {idx + 1}: {bloque}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
                {reservas.length} Citas
              </span>
            </div>

            <div className="space-y-2 min-h-[120px]">
              {reservas.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Sin reservas en este bloque
                </div>
              ) : (
                reservas.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-zinc-900/40 border border-border rounded-xl flex items-center justify-between hover:border-secondary/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1">
                        <Car className="h-3.5 w-3.5 text-secondary" />
                        {r.placa}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Ticket: {r.nroTicket || "#RES"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmado
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Crear Reserva */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-secondary" />
              Agendar Nueva Cita
            </h3>

            <form onSubmit={handleCrearReserva} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Nombre del Cliente *</Label>
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Número de Placa *</Label>
                <Input
                  placeholder="Ej. ABC-123"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  required
                  className="text-xs h-9 uppercase font-mono tracking-widest font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Hora Programada *</Label>
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs font-bold">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold bg-secondary text-secondary-foreground">
                  Confirmar Reserva
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
