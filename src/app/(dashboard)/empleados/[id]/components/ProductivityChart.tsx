"use client";

import dynamic from "next/dynamic";

const ProductivityChartInner = dynamic(
  () => import("./ProductivityChartInner").then((m) => m.ProductivityChartInner),
  { ssr: false }
);

interface ProductivityChartProps {
  data: { fecha: string; cantidad: number; total: number }[];
  rol: string;
}

export function ProductivityChart(props: ProductivityChartProps) {
  return <ProductivityChartInner {...props} />;
}
