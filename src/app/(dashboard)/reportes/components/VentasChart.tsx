"use client";

import dynamic from "next/dynamic";
import type { VentaDiaria } from "./types";

const VentasChartInner = dynamic(
  () => import("./VentasChartInner").then((m) => m.VentasChartInner),
  { ssr: false }
);

interface VentasChartProps {
  ventasDiarias: VentaDiaria[];
}

export function VentasChart(props: VentasChartProps) {
  return <VentasChartInner {...props} />;
}
