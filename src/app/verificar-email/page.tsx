import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell title="Confirmação de e-mail" description="Estamos confirmando o seu endereço de e-mail" footer={null}>
      <VerifyEmailPanel token={token} />
    </AuthShell>
  );
}
