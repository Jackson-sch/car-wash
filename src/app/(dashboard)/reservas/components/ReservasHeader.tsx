"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

interface ReservasHeaderProps {
  fecha: string;
  onDateChange: (newDate: string) => void;
  onDayOffset: (offset: number) => void;
  onSetToday: () => void;
  onOpenNuevaCita: () => void;
}

export function ReservasHeader({
  fecha,
  onDateChange,
  onDayOffset,
  onSetToday,
  onOpenNuevaCita,
}: ReservasHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = new Date(`${fecha}T12:00:00`);
  const isToday = fecha === new Date().toISOString().split("T")[0];

  const handleSelectDate = (d?: Date) => {
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      onDateChange(`${year}-${month}-${day}`);
      setCalendarOpen(false);
    }
  };

  const formattedDisplayDate = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(selectedDate);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/40">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-secondary/10 text-secondary">
            <CalendarIcon className="size-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Agenda & Reservas de Lavado
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Planificación de turnos por bahía, control de flujo y citas previas de clientes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Navegador de Fecha Elegante con Popover */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-xs">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDayOffset(-1)}
            className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
            title="Día anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <button
            type="button"
            onClick={onSetToday}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              isToday
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Hoy
          </button>

          {/* Selector Popover */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger className="h-8 px-2.5 text-xs font-bold gap-1.5 cursor-pointer capitalize text-foreground hover:bg-muted/50 inline-flex items-center rounded-lg transition-colors">
              <CalendarIcon className="size-3.5 text-secondary" />
              <span>{formattedDisplayDate}</span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-popover border border-border rounded-2xl shadow-xl z-50"
              align="end"
            >
              <div className="p-3 border-b border-border/40 flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground">Seleccionar Fecha</span>
                <button
                  type="button"
                  onClick={() => {
                    onSetToday();
                    setCalendarOpen(false);
                  }}
                  className="text-secondary hover:underline cursor-pointer"
                >
                  Ir a Hoy
                </button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                locale={es}
                autoFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDayOffset(1)}
            className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
            title="Día siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Botón Nueva Cita */}
        <Button
          type="button"
          onClick={onOpenNuevaCita}
          className="h-9 px-4 text-xs font-bold gap-1.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nueva Cita</span>
        </Button>
      </div>
    </div>
  );
}
