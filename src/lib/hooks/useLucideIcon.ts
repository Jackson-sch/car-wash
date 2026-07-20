"use client";

import { useEffect, useState, useRef, startTransition } from "react";

type LucideIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;

const iconCache = new Map<string, LucideIconComponent>();
let _cachedModule: Record<string, LucideIconComponent> | null = null;
let importPromise: Promise<Record<string, LucideIconComponent>> | null = null;

/**
 * Hook that lazily imports a specific icon from `lucide-react` (~120KB tree-shaken)
 * on demand. Uses a module-level cache so the entire library is loaded at most once.
 *
 * Returns `null` while the icon module is loading (the consumer should render
 * a placeholder or skip rendering).
 *
 * @example
 * ```tsx
 * const ArrowRight = useLucideIcon("ArrowRight");
 * if (!ArrowRight) return <span className="h-4 w-4" />;
 * return <ArrowRight className="h-4 w-4" />;
 * ```
 */
export function useLucideIcon(name: string): LucideIconComponent | null {
  const [Icon, setIcon] = useState<LucideIconComponent | null>(
    () => iconCache.get(name) ?? null
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const cached = iconCache.get(name);
    if (cached) {
      startTransition(() => {
        setIcon(() => cached);
      });
      return;
    }

    if (!importPromise) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      importPromise = import("lucide-react") as Promise<any>;
    }

    importPromise
      .then((mod) => {
        _cachedModule = mod;
        const Component = mod[name];
        if (Component && mountedRef.current) {
          iconCache.set(name, Component);
          setIcon(() => Component);
        }
      })
      .catch((err) => {
        console.error(`[useLucideIcon] Failed to load icon "${name}":`, err);
      });

    return () => {
      mountedRef.current = false;
    };
  }, [name]);

  return Icon;
}
