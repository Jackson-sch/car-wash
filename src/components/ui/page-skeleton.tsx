import { Skeleton } from "@/components/ui/skeleton";

/**
 * PageSkeleton — fallback visual para Suspense boundaries.
 * Muestra placeholders animados que imitan la estructura de las páginas
 * mientras el contenido dinámico se carga (PPR streaming).
 *
 * Variantes:
 * - "default": skeleton genérico de página
 * - "dashboard": skeleton con KPIs + gráficos
 * - "table": skeleton de tabla
 */
interface PageSkeletonProps {
  variant?: "default" | "dashboard" | "table";
}

export default function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="bg-card border border-border p-6 rounded-2xl">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        {/* Queue */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-3 animate-pulse">
        <Skeleton className="h-8 w-48 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
