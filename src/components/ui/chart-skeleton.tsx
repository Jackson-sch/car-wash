"use client";

import { Card } from "@/components/ui/card";

interface ChartSkeletonProps {
  /** Height of the default chart body skeleton (Tailwind class, default "h-80") */
  height?: string;
  /** Additional CSS classes for the Card wrapper */
  className?: string;
  /**
   * Custom content replacing the entire default skeleton (title + body).
   * When omitted, renders a standard title bar + animated pulse rectangle.
   */
  children?: React.ReactNode;
}

/**
 * Shared loading skeleton for chart components using the `useRecharts` hook.
 *
 * Default: renders a Card with a title skeleton bar and an animated pulse body.
 * Use `children` to provide a fully custom layout (e.g. button placeholders,
 * badge placeholders, circular loading indicators).
 * Use `className` for grid-span classes like `lg:col-span-3`.
 * Use `height` to control the body area height (default "h-80").
 */
export function ChartSkeleton({
  height = "h-80",
  className = "",
  children,
}: ChartSkeletonProps) {
  return (
    <Card className={`p-6 border-border bg-card shadow-sm space-y-4 ${className}`}>
      {children || (
        <>
          <div className="border-b border-border pb-3">
            <div className="h-3 w-48 bg-muted/40 rounded animate-pulse" />
          </div>
          <div className={`${height} w-full bg-muted/20 rounded-lg animate-pulse`} />
        </>
      )}
    </Card>
  );
}
