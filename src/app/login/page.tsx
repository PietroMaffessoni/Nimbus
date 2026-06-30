import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Entre com seus dados para acessar sua conta"
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
