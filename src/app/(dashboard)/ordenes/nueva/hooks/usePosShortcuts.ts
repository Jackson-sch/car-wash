"use client";

import { useEffect, useCallback } from "react";

export interface ShortcutItem {
  keyLabel: string;
  actionLabel: string;
  description: string;
  category: "navegacion" | "seleccion" | "orden";
}

export const POS_SHORTCUTS_GUIDE: ShortcutItem[] = [
  {
    keyLabel: "Ctrl + Enter",
    actionLabel: "Crear Orden",
    description: "Registra la orden inmediatamente y la envía a cola de lavado.",
    category: "orden",
  },
  {
    keyLabel: "Alt + L",
    actionLabel: "Enfocar Placa",
    description: "Lleva el cursor al campo de placa para iniciar una nueva búsqueda.",
    category: "navegacion",
  },
  {
    keyLabel: "Alt + 1 .. 7",
    actionLabel: "Tipo de Vehículo",
    description: "Selecciona Sedán (1), SUV (2), Pickup (3), Moto (4), Camión (5), Van (6) u Otro (7).",
    category: "seleccion",
  },
  {
    keyLabel: "/",
    actionLabel: "Buscar Servicio",
    description: "Enfoca la barra de búsqueda rápida del catálogo de servicios.",
    category: "navegacion",
  },
  {
    keyLabel: "Alt + C",
    actionLabel: "Datos del Cliente",
    description: "Enfoca el campo de teléfono/nombre del cliente.",
    category: "navegacion",
  },
  {
    keyLabel: "Alt + K / ?",
    actionLabel: "Ver Atajos",
    description: "Abre la guía completa de comandos rápidos de teclado.",
    category: "navegacion",
  },
  {
    keyLabel: "Esc",
    actionLabel: "Cerrar / Desenfocar",
    description: "Cierra modales emergentes o quita el foco del buscador.",
    category: "navegacion",
  },
  {
    keyLabel: "↵ Enter / P",
    actionLabel: "Imprimir Ticket (en modal de éxito)",
    description: "Imprime el ticket de trabajo de la orden recién creada.",
    category: "orden",
  },
  {
    keyLabel: "N / Espacio",
    actionLabel: "Siguiente Auto (en modal de éxito)",
    description: "Cierra el modal y reinicia el formulario listo para el siguiente vehículo.",
    category: "orden",
  },
  {
    keyLabel: "O",
    actionLabel: "Ver Órdenes (en modal de éxito)",
    description: "Navega a la cola y tablero general de órdenes de patio.",
    category: "orden",
  },
];

interface UsePosShortcutsProps {
  onFocusPlaca?: () => void;
  onSelectVehiculoTipoByIndex?: (index: number) => void;
  onFocusSearch?: () => void;
  onFocusCliente?: () => void;
  onSubmitOrder?: () => void;
  onToggleShortcutsModal?: () => void;
  enabled?: boolean;
}

export function usePosShortcuts({
  onFocusPlaca,
  onSelectVehiculoTipoByIndex,
  onFocusSearch,
  onFocusCliente,
  onSubmitOrder,
  onToggleShortcutsModal,
  enabled = true,
}: UsePosShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      // 1. GLOBAL: Ctrl + Enter / Meta + Enter -> Crear Orden (funciona incluso dentro de inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmitOrder?.();
        return;
      }

      // 2. GLOBAL: Alt + L -> Enfocar Placa
      if (e.altKey && e.code === "KeyL") {
        e.preventDefault();
        onFocusPlaca?.();
        return;
      }

      // 3. GLOBAL: Alt + 1..7 -> Cambiar tipo de vehículo
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 7) {
          e.preventDefault();
          onSelectVehiculoTipoByIndex?.(num - 1);
          return;
        }
      }

      // 4. GLOBAL: Alt + C -> Enfocar Cliente
      if (e.altKey && e.code === "KeyC") {
        e.preventDefault();
        onFocusCliente?.();
        return;
      }

      // 5. GLOBAL: Alt + K -> Ver atajos
      if (e.altKey && e.code === "KeyK") {
        e.preventDefault();
        onToggleShortcutsModal?.();
        return;
      }

      // 6. TECLAS SIMPLES (Sólo cuando NO estamos escribiendo en un input)
      if (!isInput) {
        if (e.key === "/") {
          e.preventDefault();
          onFocusSearch?.();
          return;
        }

        if (e.key === "?") {
          e.preventDefault();
          onToggleShortcutsModal?.();
          return;
        }
      }
    },
    [
      enabled,
      onSubmitOrder,
      onFocusPlaca,
      onSelectVehiculoTipoByIndex,
      onFocusCliente,
      onToggleShortcutsModal,
      onFocusSearch,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
