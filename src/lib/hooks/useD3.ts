"use client";

import { useEffect, useState, useRef, startTransition } from "react";

type D3Module = typeof import("d3");

/**
 * Module-level cache: ensures d3 is only ever loaded once
 * across all chart components in the app.
 */
let cachedModule: D3Module | null = null;
let importPromise: Promise<D3Module> | null = null;

/**
 * Hook that lazily imports `d3` (~500KB) on demand.
 *
 * Returns `null` while the module is loading (components should show
 * a skeleton/placeholder), and the full d3 namespace once loaded.
 *
 * The module is cached after the first load so subsequent charts
 * get it synchronously.
 */
export function useD3(): D3Module | null {
  const [d3Module, setD3Module] = useState<D3Module | null>(cachedModule);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (cachedModule) {
      startTransition(() => {
        setD3Module(cachedModule);
      });
      return;
    }

    if (!importPromise) {
      importPromise = import("d3") as Promise<D3Module>;
    }

    importPromise
      .then((mod) => {
        cachedModule = mod;
        if (mountedRef.current) {
          setD3Module(mod);
        }
      })
      .catch((err) => {
        console.error("[useD3] Failed to load d3:", err);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return d3Module;
}
