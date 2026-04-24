"use client"

import { Fragment } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/primitives/breadcrumb"
import {
  type LinkComponent,
  useLinkComponent,
} from "@workspace/ui/components/link-component-provider"
import {
  useBreadcrumb,
  type BreadcrumbItemType,
} from "@workspace/ui/components/breadcrumb-provider"
import { cn } from "@workspace/lib/utils"

export interface BreadcrumbsProps {
  breadcrumbs?: BreadcrumbItemType[]
  Link?: LinkComponent
}

export function Breadcrumbs({
  breadcrumbs: _breadcrumbs,
  Link: _link,
}: BreadcrumbsProps) {
  const Link = useLinkComponent() ?? _link
  const breadcrumbs = useBreadcrumb() ?? _breadcrumbs

  if (!breadcrumbs) return null

  return (
    <>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="flex items-center">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <Fragment key={index}>
                  <BreadcrumbItem
                    className={cn("hidden md:block", isLast && "block")}
                  >
                    {isLast ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={
                          Link ? (
                            <Link href={item.href}>{item.title}</Link>
                          ) : (
                            <a href={item.href}>{item.title}</a>
                          )
                        }
                      />
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </>
  )
}
