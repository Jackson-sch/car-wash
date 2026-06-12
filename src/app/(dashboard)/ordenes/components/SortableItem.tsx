"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OrderCard } from "./OrderCard";
import type { Orden, Lavador } from "./OrdenesTable";

interface SortableItemProps {
  orden: Orden;
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
  onEdit?: (orden: Orden) => void;
}

export function SortableItem({
  orden,
  lavadores,
  onStatusChange,
  onAssignLavador,
  onEdit,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: orden.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full touch-none">
      <OrderCard 
        orden={orden} 
        lavadores={lavadores} 
        onStatusChange={onStatusChange} 
        onAssignLavador={onAssignLavador} 
        onEdit={onEdit}
        isDragging={isDragging}
      />
    </div>
  );
}
