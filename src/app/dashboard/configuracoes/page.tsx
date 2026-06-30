import { getOrganizationSettings } from "@/actions/organization";
import { OrganizationForm } from "@/components/configuracoes/organization-form";
import { ProfileForm } from "@/components/configuracoes/profile-form";
import { PasswordForm } from "@/components/configuracoes/password-form";
import { AppearanceForm } from "@/components/configuracoes/appearance-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ConfiguracoesPage() {
  const { organization, user } = await getOrganizationSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie sua empresa, sua conta e preferências.</p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>
        <TabsContent value="empresa">
          <OrganizationForm
            defaultValues={{
              name: organization.name,
              document: organization.document ?? "",
              phone: organization.phone ?? "",
              address: organization.address ?? "",
            }}
          />
        </TabsContent>
        <TabsContent value="perfil">
          <ProfileForm defaultValues={{ name: user.name, email: user.email }} />
        </TabsContent>
        <TabsContent value="seguranca">
          <PasswordForm />
        </TabsContent>
        <TabsContent value="aparencia">
          <AppearanceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
