import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Página não encontrada</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          O que você procura não existe ou foi removido.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
