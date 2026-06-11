"use client";

import { useMemo, useState, useEffect } from "react";
import type { Orden, Lavador } from "./OrdenesTable";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { OrderCard } from "./OrderCard";
import { SortableItem } from "./SortableItem";

interface OrdenesBoardProps {
  ordenes: Orden[];
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
}

export function OrdenesBoard({ ordenes, lavadores, onStatusChange, onAssignLavador }: OrdenesBoardProps) {
  // Use a local state to allow instant UI updates on drag
  const [localOrdenes, setLocalOrdenes] = useState<Orden[]>(ordenes);

  // Sync with prop when it changes (like after mutation)
  useEffect(() => {
    setLocalOrdenes(ordenes);
  }, [ordenes]);

  const pendientes = localOrdenes.filter(o => o.estado === "pendiente");
  const enProceso = localOrdenes.filter(o => o.estado === "en_proceso");
  const completados = localOrdenes.filter(o => o.estado === "completado");

  const columns = [
    {
      id: "pendiente",
      title: "Cola de Espera",
      count: pendientes.length,
      items: pendientes,
      color: "bg-amber-500",
      borderColor: "border-amber-500/30",
      headerBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
    },
    {
      id: "en_proceso",
      title: "Bahía de Lavado",
      count: enProceso.length,
      items: enProceso,
      color: "bg-sky-500",
      borderColor: "border-sky-500/30",
      headerBg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400"
    },
    {
      id: "completado",
      title: "Zona de Entrega",
      count: completados.length,
      items: completados,
      color: "bg-emerald-500",
      borderColor: "border-emerald-500/30",
      headerBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging only after 5px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the item
    const activeItem = localOrdenes.find(o => o.id === activeId);
    if (!activeItem) return;

    // Find the destination container
    // If we dropped over a column header or empty column space, overId is the column id
    // If we dropped over another item, we find which column that item belongs to
    let destStatus = overId as Orden["estado"];
    
    if (destStatus !== "pendiente" && destStatus !== "en_proceso" && destStatus !== "completado") {
      const overItem = localOrdenes.find(o => o.id === overId);
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
          item.id === activeId ? { ...item, estado: destStatus } : item
        )
      );

      // Persist
      onStatusChange(activeId as string, destStatus);
    }
  };

  const activeOrden = useMemo(
    () => localOrdenes.find(o => o.id === activeId),
    [activeId, localOrdenes]
  );

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start w-full overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-3 min-w-0 w-full">
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${col.borderColor} ${col.headerBg} backdrop-blur-sm shadow-sm w-full min-w-0`}>
              <h3 className="font-black uppercase tracking-wider text-xs flex items-center gap-2 truncate">
                <div className={`w-2 h-2 rounded-full ${col.color} shrink-0`} />
                <span className="truncate">{col.title}</span>
              </h3>
              <span className="font-black text-sm bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-md shrink-0">
                {col.count}
              </span>
            </div>

            {/* Column Body / Droppable Area */}
            <SortableContext 
              id={col.id}
              items={col.items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3 min-h-[250px] w-full min-w-0 pb-4">
                {col.items.map((orden) => (
                  <SortableItem 
                    key={orden.id} 
                    orden={orden} 
                    lavadores={lavadores} 
                    onStatusChange={onStatusChange} 
                    onAssignLavador={onAssignLavador} 
                  />
                ))}
                
                {col.items.length === 0 && (
                  <div className="h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-xs font-bold text-zinc-400 dark:text-zinc-500 w-full opacity-50">
                    Soltar tarjeta aquí
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeOrden ? (
          <div className="w-[300px] sm:w-[350px]">
             <OrderCard 
              orden={activeOrden} 
              lavadores={lavadores} 
              onStatusChange={onStatusChange} 
              onAssignLavador={onAssignLavador} 
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
