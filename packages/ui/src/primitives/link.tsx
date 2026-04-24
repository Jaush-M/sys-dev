"use client"

import { createElement } from "react"
import {
  LinkProps,
  useLinkComponent,
} from "@workspace/ui/components/link-component-provider"

export function Link(props: LinkProps) {
  const LinkComp = useLinkComponent()

  if (LinkComp) {
    return createElement(LinkComp, props)
  }

  return <a {...props} />
}
