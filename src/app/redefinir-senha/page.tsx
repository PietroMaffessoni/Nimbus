import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta"
      footer={
        <>
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Link inválido. Solicite uma nova redefinição de senha na tela de{" "}
            <Link href="/esqueci-senha" className="font-medium text-primary hover:underline">
              esqueci minha senha
            </Link>
            .
          </p>
        </div>
      )}
    </AuthShell>
  );
}
