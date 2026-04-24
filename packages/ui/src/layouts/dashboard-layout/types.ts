import { LucideIcon, LucideProps } from "lucide-react";

export type DashboardNavItemType = {
  title: string;
  icon?: LucideIcon;
  iconProps?: LucideProps;
} & (
  | {
      href: string;
      onClick?: never;
    }
  | {
      onClick: () => void;
      href?: never;
    }
);
