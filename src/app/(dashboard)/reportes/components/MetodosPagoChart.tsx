"use client";

import dynamic from "next/dynamic";
import type { PagoMetodo } from "./types";

const MetodosPagoChartInner = dynamic(
  () => import("./MetodosPagoChartInner").then((m) => m.MetodosPagoChartInner),
  { ssr: false }
);

interface MetodosPagoChartProps {
  pagosMetodo: PagoMetodo[];
}

export function MetodosPagoChart(props: MetodosPagoChartProps) {
  return <MetodosPagoChartInner {...props} />;
}
