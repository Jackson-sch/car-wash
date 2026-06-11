import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  valueColor?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  iconBg = "bg-blue-50",
  iconColor = "text-secondary",
  valueColor = "text-zinc-900",
}: StatsCardProps) {
  return (
    <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-zinc-350 transition-all flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
          {label}
        </span>
        <div className={`text-2xl sm:text-3xl font-extrabold ${valueColor}`}>
          {value}
        </div>
      </div>
      <div className={`p-3.5 rounded-xl ${iconBg} ${iconColor}`}>
        {icon}
      </div>
    </Card>
  );
}
