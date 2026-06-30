"use client";

import { usePathname } from "next/navigation";

import { navItems } from "@/components/layout/nav-items";

export function PageTitle() {
  const pathname = usePathname();
  const current = [...navItems].reverse().find((item) => pathname.startsWith(item.href));

  return <h1 className="text-base font-semibold text-foreground">{current?.label ?? "Visão geral"}</h1>;
}
