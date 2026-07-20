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
      className={`flex flex-col gap-3 min-h-[200px] w-full min-w-0 pb-4 rounded-xl transition-all duration-300 ${
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

function EmptyColumnPlaceholder({
  isOver,
  isAnyDragging,
}: {
  isOver: boolean;
  isAnyDragging: boolean;
}) {
  if (!isAnyDragging && !isOver) {
    return (
      <div className="h-48 rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 w-full select-none">
        <div className="w-8 h-0.5 rounded-full bg-border/40" />
        <span>Cola vacía</span>
      </div>
    );
  }

  return (
    <div
      className={`h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-xs font-bold w-full select-none transition-all duration-300 ${
        isOver
          ? "border-secondary/60 bg-secondary/10 text-secondary scale-[1.02] shadow-lg shadow-secondary/10"
          : "border-zinc-300/40 dark:border-zinc-600/40 text-zinc-400 dark:text-zinc-500 bg-zinc-50/20 dark:bg-zinc-800/10"
      }`}
    >
      <div
        className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
          isOver ? "bg-secondary/60 w-12" : "bg-border/40"
        }`}
      />
      <span className="transition-all duration-300">
        {isOver ? "¡Suelta aquí!" : "Soltar tarjeta aquí"}
      </span>
      {isOver && (
        <span className="text-[10px] font-normal text-muted-foreground animate-fade-in">
          La tarjeta se moverá a esta columna
        </span>
      )}
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
      count: pendientes.length,
      items: pendientes,
      color: "bg-amber-500",
      borderColor: "border-amber-500/30",
      headerBg:
        "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
      emptyIcon: "🕐",
    },
    {
      id: "en_proceso" as const,
      title: "Bahía de Lavado",
      count: enProceso.length,
      items: enProceso,
      color: "bg-sky-500",
      borderColor: "border-sky-500/30",
      headerBg:
        "bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400",
      emptyIcon: "🚗",
    },
    {
      id: "completado" as const,
      title: "Zona de Entrega",
      count: completados.length,
      items: completados,
      color: "bg-emerald-500",
      borderColor: "border-emerald-500/30",
      headerBg:
        "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
      emptyIcon: "✅",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start w-full overflow-hidden">
        {columns.map((col) => {
          const isColumnHovered = dragOverColumnId === col.id;

          return (
            <div key={col.id} className="flex flex-col gap-3 min-w-0 w-full">
              {/* Column Header */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm shadow-sm w-full min-w-0 transition-all duration-300 ${
                  isColumnHovered && isAnyDragging
                    ? `${col.borderColor} ${col.headerBg} ring-2 ring-secondary/40 scale-[1.02]`
                    : `${col.borderColor} ${col.headerBg}`
                }`}
              >
                <h3 className="font-black uppercase tracking-wider text-xs flex items-center gap-2 truncate">
                  <div className={`w-2 h-2 rounded-full ${col.color} shrink-0`} />
                  <span className="truncate">{col.title}</span>
                </h3>
                <span
                  className={`font-black text-sm px-2 py-0.5 rounded-md shrink-0 transition-all duration-300 ${
                    isColumnHovered && isAnyDragging
                      ? "bg-secondary text-secondary-foreground shadow-sm scale-110"
                      : "bg-white/50 dark:bg-black/20"
                  }`}
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
          <div className="w-[300px] sm:w-[350px] rotate-2 scale-105 shadow-2xl shadow-secondary/20 ring-2 ring-secondary/50 rounded-xl overflow-hidden animate-in zoom-in-90 duration-150">
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
