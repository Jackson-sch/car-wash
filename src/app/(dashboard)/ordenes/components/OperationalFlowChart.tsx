"use client";

import dynamic from "next/dynamic";
import type { Orden } from "./OrdenesTable";

const OperationalFlowChartInner = dynamic(
  () => import("./OperationalFlowChartInner").then((m) => m.OperationalFlowChartInner),
  { ssr: false }
);

interface OperationalFlowChartProps {
  ordenes: Orden[];
}

export function OperationalFlowChart(props: OperationalFlowChartProps) {
  return <OperationalFlowChartInner {...props} />;
}
