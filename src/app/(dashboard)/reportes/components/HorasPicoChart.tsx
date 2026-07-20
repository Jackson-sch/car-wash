"use client";

import dynamic from "next/dynamic";
import type { HoraPico } from "./types";

const HorasPicoChartInner = dynamic(
  () => import("./HorasPicoChartInner").then((m) => m.HorasPicoChartInner),
  { ssr: false }
);

interface HorasPicoChartProps {
  horasPico: HoraPico[];
}

export function HorasPicoChart(props: HorasPicoChartProps) {
  return <HorasPicoChartInner {...props} />;
}
