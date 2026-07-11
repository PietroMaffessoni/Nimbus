"use client";

import * as React from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/actions/auth";

export function EmailVerificationBanner() {
  const [loading, setLoading] = React.useState(false);

  async function handleResend() {
    setLoading(true);
    const result = await resendVerificationEmail();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("E-mail de confirmação reenviado.");
  }

  return (
    <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-foreground">
          Confirme seu e-mail para garantir que você não perca comunicações importantes sobre sua conta.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleResend} disabled={loading} className="shrink-0">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Reenviar e-mail
      </Button>
    </div>
  );
}
