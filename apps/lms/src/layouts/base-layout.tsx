"use client"

import { BaseLayout as PrimitiveBaseLayout } from "@workspace/ui/layouts/base-layout"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient()

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <PrimitiveBaseLayout>{children}</PrimitiveBaseLayout>
    </QueryClientProvider>
  )
}
