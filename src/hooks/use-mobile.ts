import * as React from "react"

const MOBILE_BREAKPOINT = 768

function getMobileSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function subscribeToMobileChange(callback: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useIsMobile(): boolean {
  const isMobile = React.useSyncExternalStore(
    subscribeToMobileChange,
    getMobileSnapshot,
    () => false, // SSR fallback
  )
  return isMobile
}
