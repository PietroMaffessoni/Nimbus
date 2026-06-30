"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { organizationSchema, type OrganizationInput } from "@/lib/validations/organization";
import { updateOrganization } from "@/actions/organization";

export function OrganizationForm({ defaultValues }: { defaultValues: OrganizationInput }) {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationInput>({ resolver: zodResolver(organizationSchema), defaultValues });

  async function onSubmit(values: OrganizationInput) {
    setLoading(true);
    const result = await updateOrganization(values);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Dados da empresa atualizados.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
          <CardDescription>Essas informações aparecem nos seus documentos e relatórios.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-name">Nome da empresa</Label>
            <Input id="org-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-document">CNPJ / CPF</Label>
            <Input id="org-document" {...register("document")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone">Telefone</Label>
            <Input id="org-phone" {...register("phone")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-address">Endereço</Label>
            <Input id="org-address" {...register("address")} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
