"use client";

import type { Categoria } from "./ServiciosGrid";

interface ServiciosCategoryTabsProps {
  categorias: Categoria[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ServiciosCategoryTabs({ categorias, activeTab, onTabChange }: ServiciosCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
      <button
        onClick={() => onTabChange("todos")}
        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          activeTab === "todos"
            ? "bg-card text-foreground shadow-sm border border-zinc-200"
            : "text-zinc-500 hover:text-zinc-855 dark:hover:text-zinc-100"
        }`}
      >
        Todos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onTabChange(cat.id)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === cat.id
              ? "bg-card text-foreground shadow-sm border border-zinc-200"
              : "text-zinc-500 hover:text-zinc-855 dark:hover:text-zinc-100"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
