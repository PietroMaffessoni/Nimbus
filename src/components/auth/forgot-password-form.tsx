"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/actions/auth";

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setLoading(true);
    const result = await requestPasswordReset(values);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">
          Se esse e-mail existir na nossa base, enviamos um link para redefinir sua senha. Verifique sua caixa de
          entrada (e o spam).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="voce@empresa.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar link de redefinição
      </Button>
    </form>
  );
}
