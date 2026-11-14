"use client";

import dynamic from "next/dynamic";

const SalesTrendChartInner = dynamic(
  () => import("./SalesTrendChartInner").then((m) => m.SalesTrendChartInner),
  { ssr: false }
);

import type { TopServiceItem, PaymentBreakdownItem } from "@/lib/actions/dashboard";

interface SalesTrendChartProps {
  data: { day: string; ventas: number }[];
  topServicios?: TopServiceItem[];
  pagosBreakdown?: PaymentBreakdownItem[];
}

export function SalesTrendChart(props: SalesTrendChartProps) {
  return <SalesTrendChartInner {...props} />;
}
