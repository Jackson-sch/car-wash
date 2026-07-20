"use client";

import dynamic from "next/dynamic";

const SalesTrendChartInner = dynamic(
  () => import("./SalesTrendChartInner").then((m) => m.SalesTrendChartInner),
  { ssr: false }
);

interface SalesTrendChartProps {
  data: { day: string; ventas: number }[];
}

export function SalesTrendChart(props: SalesTrendChartProps) {
  return <SalesTrendChartInner {...props} />;
}
