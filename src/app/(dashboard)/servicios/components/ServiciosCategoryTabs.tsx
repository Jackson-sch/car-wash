"use client";

import type { Categoria } from "./ServiciosGrid";

interface ServiciosCategoryTabsProps {
  categorias: Categoria[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ServiciosCategoryTabs({ categorias, activeTab, onTabChange }: ServiciosCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
      <button
        type="button"
        onClick={() => onTabChange("todos")}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
          activeTab === "todos"
            ? "bg-card text-foreground shadow-xs border border-border"
            : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/15"
        }`}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          type="button"
          key={cat.id}
          onClick={() => onTabChange(cat.id)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === cat.id
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/15"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
