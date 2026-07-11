import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar({ organizationName }: { organizationName: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex print:hidden">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-sidebar-foreground">
          Nimbus
        </Link>
      </div>
      <div className="mx-5 mb-2 truncate rounded-lg bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-foreground/70">
        {organizationName}
      </div>
      <SidebarNav />
      <div className="px-5 py-4 text-xs text-sidebar-foreground/50">v0.1 · MVP</div>
    </aside>
  );
}
