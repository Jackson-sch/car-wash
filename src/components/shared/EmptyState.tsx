import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-card/40 border border-dashed border-border/80 backdrop-blur-xs ${className}`}
    >
      {/* Icon with glowing ambient container */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-xl" />
        <div className="relative h-14 w-14 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary shadow-xs">
          <Icon className="h-7 w-7" />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight max-w-md">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs gap-1.5 shadow-sm shadow-secondary/20 cursor-pointer active:scale-95 transition-all">
                  <ActionIcon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              </Link>
            ) : (
              <Button
                onClick={action.onClick}
                className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs gap-1.5 shadow-sm shadow-secondary/20 cursor-pointer active:scale-95 transition-all"
              >
                <ActionIcon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-muted cursor-pointer active:scale-95 transition-all">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-muted cursor-pointer active:scale-95 transition-all"
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
