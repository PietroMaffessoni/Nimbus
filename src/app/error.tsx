"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-semibold tracking-tight">Algo deu errado</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente em instantes.
        </p>
      </div>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
