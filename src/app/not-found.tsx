import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-semibold tracking-tight">Página não encontrada</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          O endereço que você acessou não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          Voltar para o início <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
