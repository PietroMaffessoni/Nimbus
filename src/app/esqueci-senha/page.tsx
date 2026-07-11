import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      title="Esqueceu sua senha?"
      description="Informe seu e-mail e enviaremos um link para redefinir sua senha"
      footer={
        <>
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
