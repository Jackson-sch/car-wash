"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors outline-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        size === "sm" ? "h-4.5 w-8" : "h-6 w-11",
        "data-checked:bg-secondary border border-transparent",
        "data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700/80 data-unchecked:border-zinc-300 dark:data-unchecked:border-zinc-600/60",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full shadow-xs ring-0 transition-transform duration-200 ease-in-out",
          size === "sm"
            ? "size-3.5 data-checked:translate-x-3.5 data-unchecked:translate-x-0"
            : "size-5 data-checked:translate-x-5 data-unchecked:translate-x-0",
          "bg-white dark:bg-white data-unchecked:bg-white dark:data-unchecked:bg-zinc-200"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
