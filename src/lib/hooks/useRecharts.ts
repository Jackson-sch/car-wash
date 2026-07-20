"use client";

import { useEffect, useState, useRef, startTransition } from "react";

/**
 * Module-level cache: ensures recharts is only ever loaded once
 * across all chart components in the app.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedModule: Record<string, any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let importPromise: Promise<Record<string, any>> | null = null;

/**
 * Hook that lazily imports the heavy `recharts` library on demand.
 *
 * Returns `null` while the module is loading (components should show
 * a skeleton/placeholder), and the full recharts module once loaded.
 *
 * The module is cached after the first load so subsequent charts
 * get it synchronously.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRecharts(): Record<string, any> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recharts, setRecharts] = useState<Record<string, any> | null>(cachedModule);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (cachedModule) {
      startTransition(() => {
        setRecharts(cachedModule);
      });
      return;
    }

    if (!importPromise) {
      importPromise = import("recharts");
    }

    importPromise
      .then((mod) => {
        cachedModule = mod;
        if (mountedRef.current) {
          setRecharts(mod);
        }
      })
      .catch((err) => {
        console.error("[useRecharts] Failed to load recharts:", err);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return recharts;
}
