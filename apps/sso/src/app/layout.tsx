// @ts-expect-error css file exists
import "@workspace/ui/globals.css"

import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import { cn } from "@workspace/ui/lib/utils"
import { BaseLayout } from "@/layouts/base-layout"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "LMS Portal SSO",
  description: "LMS Portal SSO",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  )
}
