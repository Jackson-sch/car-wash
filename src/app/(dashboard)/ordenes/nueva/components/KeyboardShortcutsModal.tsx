"use client";

import { Keyboard, Info } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { POS_SHORTCUTS_GUIDE } from "../hooks/usePosShortcuts";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border rounded-3xl max-w-lg p-6 space-y-4">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/20">
            <Keyboard className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Atajos de Teclado del Terminal POS
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Optimiza tu velocidad de registro utilizando el teclado sin necesidad de usar el ratón.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="divide-y divide-border/60 max-h-[60vh] overflow-y-auto">
          {POS_SHORTCUTS_GUIDE.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-foreground leading-snug">
                  {sc.actionLabel}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {sc.description}
                </p>
              </div>

              <kbd className="px-2.5 py-1 rounded-lg bg-muted text-foreground font-mono font-bold text-xs border border-border shadow-xs shrink-0 whitespace-nowrap">
                {sc.keyLabel}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <p className="inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="size-3.5 text-secondary shrink-0" />
            <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Esc</kbd> para cerrar este panel en cualquier momento.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
