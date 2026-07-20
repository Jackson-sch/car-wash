"use client"

import { useTheme } from "@/components/shared/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { DynamicIcon } from "@/components/ui/dynamic-icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <DynamicIcon name="CircleCheckIcon" className="size-4" />
        ),
        info: (
          <DynamicIcon name="InfoIcon" className="size-4" />
        ),
        warning: (
          <DynamicIcon name="TriangleAlertIcon" className="size-4" />
        ),
        error: (
          <DynamicIcon name="OctagonXIcon" className="size-4" />
        ),
        loading: (
          <DynamicIcon name="Loader2Icon" className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
