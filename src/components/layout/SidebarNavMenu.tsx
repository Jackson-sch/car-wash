"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { NavItem } from "./nav-items";

interface SidebarNavMenuProps {
  items: NavItem[];
}

export function SidebarNavMenu({ items }: SidebarNavMenuProps) {
  const pathname = usePathname();

  const visibleItems = useMemo(() => items.filter((item) => item.show), [items]);

  return (
    <SidebarMenu className="gap-0.5">
      {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.label}
                render={<Link href={item.href} />}
                className={`w-full group/btn transition-all duration-200 active:scale-[0.98] h-8.5 px-2.5 rounded-md ${
                  isActive
                    ? "bg-secondary/10 text-secondary! font-bold"
                    : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${
                      isActive ? "text-secondary!" : "text-sidebar-foreground group-hover/btn:text-white"
                    }`}
                  />
                  <span className="group-data-[collapsible=icon]:hidden text-sm">{item.label}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
    </SidebarMenu>
  );
}
