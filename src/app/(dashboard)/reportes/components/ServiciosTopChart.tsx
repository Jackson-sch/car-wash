"use client";

import dynamic from "next/dynamic";
import type { ServicioTop } from "./types";

const ServiciosTopChartInner = dynamic(
  () => import("./ServiciosTopChartInner").then((m) => m.ServiciosTopChartInner),
  { ssr: false }
);

interface ServiciosTopChartProps {
  serviciosTop: ServicioTop[];
}

export function ServiciosTopChart(props: ServiciosTopChartProps) {
  return <ServiciosTopChartInner {...props} />;
}
