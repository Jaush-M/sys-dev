"use client"

import {
  createContext,
  useContext,
  ReactNode,
  ComponentType,
  useMemo,
} from "react"

export type LinkProps = {
  href: string
  children?: ReactNode
  [key: string]: any
}

export type LinkComponent = ComponentType<LinkProps>

const LinkContext = createContext<LinkComponent | null>(null)

type ProviderProps = {
  component: LinkComponent | null
  children: ReactNode
}

export function LinkComponentProvider({ component, children }: ProviderProps) {
  const value = useMemo(() => component, [component])

  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>
}

export function useLinkComponent(): LinkComponent | null {
  const context = useContext(LinkContext)

  return context ?? null
}
