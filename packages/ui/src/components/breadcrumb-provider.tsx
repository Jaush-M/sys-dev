"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

export type BreadcrumbItemType = {
  title: string;
  href: string;
};

const BreadcrumbValueContext = createContext<BreadcrumbItemType[] | null>(null);
const BreadcrumbSetterContext = createContext<
  ((items: BreadcrumbItemType[] | null) => void) | null
>(null);

type BreadCrumbProviderProps = {
  children: ReactNode;
};

export function BreadCrumbProvider({ children }: BreadCrumbProviderProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[] | null>(
    null,
  );

  return (
    <BreadcrumbSetterContext.Provider value={setBreadcrumbs}>
      <BreadcrumbValueContext.Provider value={breadcrumbs}>
        {children}
      </BreadcrumbValueContext.Provider>
    </BreadcrumbSetterContext.Provider>
  );
}

function useSetBreadcrumbsContext() {
  const context = useContext(BreadcrumbSetterContext);

  if (!context) {
    throw new Error("useSetBreadcrumbs must be used within BreadCrumbProvider");
  }

  return context;
}

export function useSetBreadcrumbs(breadcrumbs: BreadcrumbItemType[] | null) {
  const setBreadcrumbs = useSetBreadcrumbsContext();

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);

    return () => setBreadcrumbs(null);
  }, [breadcrumbs, setBreadcrumbs]);
}

export function useBreadcrumb(): BreadcrumbItemType[] | null {
  const context = useContext(BreadcrumbValueContext);

  return context ?? null;
}
