"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";
import { createCustomer, updateCustomer } from "@/actions/customers";

export function CustomerForm({
  customerId,
  defaultValues,
  onSuccess,
}: {
  customerId?: string;
  defaultValues?: Partial<CustomerInput>;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      document: defaultValues?.document ?? "",
      address: defaultValues?.address ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  async function onSubmit(values: CustomerInput) {
    setLoading(true);
    const result = customerId ? await updateCustomer(customerId, values) : await createCustomer(values);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(customerId ? "Cliente atualizado." : "Cliente criado.");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Nome completo ou razão social" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="document">CPF / CNPJ</Label>
          <Input id="document" placeholder="000.000.000-00" {...register("document")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" placeholder="Rua, número, cidade" {...register("address")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" placeholder="Observações sobre o cliente" {...register("notes")} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {customerId ? "Salvar alterações" : "Criar cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
}
