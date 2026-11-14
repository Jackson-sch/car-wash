"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseBandejaShortcutsProps {
  onFocusSearch: () => void;
  onClearSearch: () => void;
  onSwitchView: (mode: "patio" | "lista") => void;
  onRefresh: () => void;
  enabled?: boolean;
}

export function useBandejaShortcuts({
  onFocusSearch,
  onClearSearch,
  onSwitchView,
  onRefresh,
  enabled = true,
}: UseBandejaShortcutsProps) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      // Si está en un input y presiona Escape -> limpiar y desenfocar
      if (isInput && e.key === "Escape") {
        e.preventDefault();
        onClearSearch();
        (activeElement as HTMLElement)?.blur();
        return;
      }

      // Atajos que solo se disparan si NO estamos escribiendo en un input
      if (!isInput) {
        // N -> Nueva orden
        if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          router.push("/ordenes/nueva");
          return;
        }

        // / -> Buscar
        if (e.key === "/") {
          e.preventDefault();
          onFocusSearch();
          return;
        }

        // P o 1 -> Vista Patio Kanban
        if (e.key.toLowerCase() === "p" || e.key === "1") {
          e.preventDefault();
          onSwitchView("patio");
          toast.info("Vista: Tablero de Patio", { duration: 900 });
          return;
        }

        // L o 2 -> Vista Lista
        if (e.key.toLowerCase() === "l" || e.key === "2") {
          e.preventDefault();
          onSwitchView("lista");
          toast.info("Vista: Lista detallada", { duration: 900 });
          return;
        }

        // T -> Modo TV
        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          window.open("/patio", "_blank");
          return;
        }

        // R -> Refrescar
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          onRefresh();
          return;
        }
      }
    },
    [enabled, router, onFocusSearch, onClearSearch, onSwitchView, onRefresh]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
