"use client";

import React from "react";

/**
 * AmbientBackground
 *
 * Fondo ambiental optimizado y de alto rendimiento:
 * - Sin bucles continuos de requestAnimationFrame ni event listeners de ratón
 * - Cero consumo de CPU/GPU en terminales de caja, tablets y pantallas de mostrador
 * - Resplandor sutil basado en CSS que no distrae la lectura de placas ni balances
 * - Compatible con tema claro y oscuro
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden print:hidden select-none"
    >
      {/* Resplandor superior suave */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 dark:bg-secondary/8 blur-3xl"
      />
      {/* Resplandor inferior tenue */}
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-secondary/4 dark:bg-secondary/6 blur-3xl"
      />
    </div>
  );
}