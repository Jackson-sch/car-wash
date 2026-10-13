"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { Orden, Lavador } from "./OrdenesTable";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { OrderCard } from "./OrderCard";
import { SortableItem } from "./SortableItem";

// ─── Droppable Column Body ───────────────────────────────────────────────────

interface DroppableColumnBodyProps {
  id: string;
  children: React.ReactNode;
  isAnyDragging: boolean;
}

function DroppableColumnBody({ id, children, isAnyDragging }: DroppableColumnBodyProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isHighlighted = isOver && isAnyDragging;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] w-full min-w-0 pb-4 rounded-xl transition-colors transition-transform duration-300 ${
        isHighlighted
          ? "bg-secondary/8 ring-2 ring-secondary/35 ring-inset shadow-lg shadow-secondary/10 scale-[1.01]"
          : "bg-transparent"
      }`}
    >
      {children}
    </div>
  );
}

// ─── Empty Column Placeholder ────────────────────────────────────────────────

interface EmptyColumnPlaceholderProps {
  isOver: boolean;
  isAnyDragging: boolean;
  columnId: "pendiente" | "en_proceso" | "completado";
  icon?: React.ComponentType<{ className?: string }>;
}

const EMPTY_MESSAGES = {
  pendiente: {
    title: "Cola Despejada",
    description: "No hay vehículos en espera de turno.",
  },
  en_proceso: {
    title: "Bahía Disponible",
    description: "Arrastra una orden aquí para iniciar el lavado.",
  },
  completado: {
    title: "Zona Despejada",
    description: "Todos los vehículos listos fueron entregados.",
  },
};

function EmptyColumnPlaceholder({
  isOver,
  isAnyDragging,
  columnId,
  icon: Icon = Clock,
}: EmptyColumnPlaceholderProps) {
  const content = EMPTY_MESSAGES[columnId] || {
    title: "Cola vacía",
    description: "No hay órdenes en esta bahía.",
  };

  if (!isAnyDragging && !isOver) {
    return (
      <div className="h-44 rounded-2xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-2 p-4 text-center w-full select-none transition-colors">
        <div className="p-2.5 rounded-full bg-muted/40 border border-border/40 text-muted-foreground/60">
          <Icon className="size-5" />
        </div>
        <span className="text-xs font-bold text-foreground/80">{content.title}</span>
        <span className="text-[11px] text-muted-foreground/70 max-w-[210px] leading-tight">
          {content.description}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-4 text-center w-full select-none transition-all duration-200 ${
        isOver
          ? "border-secondary bg-secondary/15 text-secondary scale-[1.02] shadow-xl shadow-secondary/10"
          : "border-border/60 text-muted-foreground/70 bg-muted/20"
      }`}
    >
      <div className={`p-2.5 rounded-full transition-colors ${isOver ? "bg-secondary/20 text-secondary" : "bg-muted/40 text-muted-foreground/60"}`}>
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-black tracking-tight">
        {isOver ? "¡Soltar en esta bahía!" : "Mover vehículo aquí"}
      </span>
      <span className="text-[10px] text-muted-foreground max-w-[200px] leading-tight">
        {isOver
          ? "El estado de la orden se actualizará automáticamente"
          : "Arrastra para cambiar de estado"}
      </span>
    </div>
  );
}

// ─── Board Component ─────────────────────────────────────────────────────────

interface OrdenesBoardProps {
  ordenes: Orden[];
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
  onEdit?: (orden: Orden) => void;
}

export function OrdenesBoard({
  ordenes,
  lavadores,
  onStatusChange,
  onAssignLavador,
  onEdit,
}: OrdenesBoardProps) {
  const [localOrdenes, setLocalOrdenes] = useState<Orden[]>(ordenes);
  const prevOrdenesRef = useRef(ordenes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Sincronizar cuando cambian las órdenes desde fuera del board
  useEffect(() => {
    if (prevOrdenesRef.current !== ordenes) {
      setLocalOrdenes(ordenes);
      prevOrdenesRef.current = ordenes;
    }
  }, [ordenes]);

  const pendientes = localOrdenes.filter((o) => o.estado === "pendiente");
  const enProceso = localOrdenes.filter((o) => o.estado === "en_proceso");
  const completados = localOrdenes.filter((o) => o.estado === "completado");

  const columns = [
    {
      id: "pendiente" as const,
      title: "Cola de Espera",
      subtitle: "Vehículos esperando asignación",
      count: pendientes.length,
      items: pendientes,
      dotColor: "bg-amber-500",
      pillClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      accentBorder: "border-amber-500/30",
      icon: Clock,
    },
    {
      id: "en_proceso" as const,
      title: "Bahía de Lavado",
      subtitle: "En proceso de lavado activo",
      count: enProceso.length,
      items: enProceso,
      dotColor: "bg-sky-500",
      pillClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      accentBorder: "border-sky-500/30",
      icon: Sparkles,
    },
    {
      id: "completado" as const,
      title: "Zona de Entrega",
      subtitle: "Listos para cobro y retiro",
      count: completados.length,
      items: completados,
      dotColor: "bg-emerald-500",
      pillClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      accentBorder: "border-emerald-500/30",
      icon: CheckCircle2,
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDragOverColumnId(null);
      return;
    }

    const overId = over.id as string;
    // Check if over a column directly
    if (
      overId === "pendiente" ||
      overId === "en_proceso" ||
      overId === "completado"
    ) {
      setDragOverColumnId(overId);
    } else {
      // Over an item - find its column
      const overItem = localOrdenes.find((o) => o.id === overId);
      if (overItem) {
        setDragOverColumnId(overItem.estado);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverColumnId(null);

    if (!over) return;

    const activeItemId = active.id;
    const overId = over.id;

    const activeItem = localOrdenes.find((o) => o.id === activeItemId);
    if (!activeItem) return;

    let destStatus = overId as Orden["estado"];

    if (
      destStatus !== "pendiente" &&
      destStatus !== "en_proceso" &&
      destStatus !== "completado"
    ) {
      const overItem = localOrdenes.find((o) => o.id === overId);
      if (overItem) {
        destStatus = overItem.estado;
      } else {
        return;
      }
    }

    if (activeItem.estado !== destStatus) {
      // Optimistic update
      setLocalOrdenes((items) =>
        items.map((item) =>
          item.id === activeItemId ? { ...item, estado: destStatus } : item,
        ),
      );

      onStatusChange(activeItemId as string, destStatus);
    }
  };

  const activeOrden = useMemo(
    () => localOrdenes.find((o) => o.id === activeId),
    [activeId, localOrdenes],
  );

  const isAnyDragging = activeId !== null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start w-full overflow-hidden">
        {columns.map((col) => {
          const isColumnHovered = dragOverColumnId === col.id;

          return (
            <div key={col.id} className="flex flex-col gap-3 min-w-0 w-full">
              {/* Column Header */}
              <div
                className={`flex items-center justify-between p-3.5 rounded-2xl border bg-card/80 backdrop-blur-md shadow-xs w-full min-w-0 transition-all duration-200 ${
                  isColumnHovered && isAnyDragging
                    ? `${col.accentBorder} ring-2 ring-secondary/50 scale-[1.01] bg-card`
                    : "border-border/70"
                }`}
              >
                <div className="flex flex-col min-w-0 gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${col.dotColor} shrink-0`} />
                    <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider truncate">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 font-medium truncate pl-4">
                    {col.subtitle}
                  </span>
                </div>

                <span
                  className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border shrink-0 transition-transform ${col.pillClass}`}
                >
                  {col.count}
                </span>
              </div>

              {/* Column Body / Droppable Area */}
              <SortableContext
                id={col.id}
                items={col.items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumnBody id={col.id} isAnyDragging={isAnyDragging}>
                  {col.items.map((orden) => (
                    <SortableItem
                      key={orden.id}
                      orden={orden}
                      lavadores={lavadores}
                      onStatusChange={onStatusChange}
                      onAssignLavador={onAssignLavador}
                      onEdit={onEdit}
                    />
                  ))}

                  {col.items.length === 0 && (
                    <EmptyColumnPlaceholder
                      isOver={isColumnHovered}
                      isAnyDragging={isAnyDragging}
                      columnId={col.id}
                      icon={col.icon}
                    />
                  )}
                </DroppableColumnBody>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeOrden ? (
          <div className="w-[300px] sm:w-[350px] rotate-2 scale-105 shadow-2xl shadow-secondary/20 ring-2 ring-secondary/50 rounded-xl overflow-hidden transition-transform duration-150">
            <OrderCard
              orden={activeOrden}
              lavadores={lavadores}
              onStatusChange={onStatusChange}
              onAssignLavador={onAssignLavador}
              onEdit={onEdit}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
