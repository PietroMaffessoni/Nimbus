"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { verifyEmail } from "@/actions/auth";

type Status = "loading" | "success" | "error" | "missing";

export function VerifyEmailPanel({ token }: { token?: string }) {
  const { update } = useSession();
  const [status, setStatus] = React.useState<Status>(token ? "loading" : "missing");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!token) return;

    let active = true;
    verifyEmail(token).then(async (result) => {
      if (!active) return;

      if (!result.success) {
        setError(result.error);
        setStatus("error");
        return;
      }

      await update();
      setStatus("success");
    });

    return () => {
      active = false;
    };
  }, [token, update]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Confirmando seu e-mail...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">Seu e-mail foi confirmado com sucesso.</p>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Ir para o dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">
        {status === "missing" ? "Link de confirmação inválido." : error}
      </p>
      <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
        Ir para o dashboard
      </Link>
    </div>
  );
}
