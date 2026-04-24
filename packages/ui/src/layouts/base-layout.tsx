"use client"

import { DirectionProvider } from "@base-ui/react"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { Toaster } from "@workspace/ui/primitives/sonner"
import { TooltipProvider } from "@workspace/ui/primitives/tooltip"

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DirectionProvider>
        <TooltipProvider delay={0}>
          {children}
          <Toaster richColors />
        </TooltipProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
