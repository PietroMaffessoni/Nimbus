"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saleSchema, type SaleInput } from "@/lib/validations/sale";
import { createSale, updateSale } from "@/actions/sales";
import { cn, formatCurrency, formatDateForInput } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: unknown;
  active: boolean;
}

export function SaleForm({
  saleId,
  customers,
  products,
  defaultValues,
}: {
  saleId?: string;
  customers: Customer[];
  products: Product[];
  defaultValues?: Partial<SaleInput>;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: defaultValues?.customerId ?? "",
      issueDate: defaultValues?.issueDate ?? formatDateForInput(new Date()),
      dueDate: defaultValues?.dueDate ?? "",
      status: defaultValues?.status ?? "DRAFT",
      notes: defaultValues?.notes ?? "",
      discount: defaultValues?.discount ?? 0,
      items: defaultValues?.items?.length
        ? defaultValues.items
        : [{ productId: "", description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = Number(watch("discount")) || 0;
  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const total = Math.max(itemsTotal - discount, 0);

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    setValue(`items.${index}.productId`, productId);
    if (product) {
      setValue(`items.${index}.description`, product.name);
      setValue(`items.${index}.unitPrice`, Number(product.price));
    }
  }

  async function onSubmit(values: SaleInput) {
    setLoading(true);
    const result = saleId ? await updateSale(saleId, values) : await createSale(values);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(saleId ? "Venda atualizada." : "Venda criada.");
    const targetId = saleId ?? ("id" in result ? result.id : undefined);
    router.push(`/dashboard/vendas/${targetId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da venda</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="customerId">Cliente</Label>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="PAID">Paga</SelectItem>
                    <SelectItem value="CANCELED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Data de emissão</Label>
            <Input id="issueDate" type="date" {...register("issueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Desconto (R$)</Label>
            <Input id="discount" type="number" step="0.01" min="0" {...register("discount")} />
            {errors.discount && <p className="text-xs text-destructive">{errors.discount.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" placeholder="Observações sobre a venda" {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itens</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="h-4 w-4" /> Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.items?.message && <p className="text-xs text-destructive">{errors.items.message}</p>}
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-12 sm:items-end">
              <div className="space-y-2 sm:col-span-4">
                <Label>Produto/Serviço</Label>
                <Select value={watch(`items.${index}.productId`) || ""} onValueChange={(value) => handleProductSelect(index, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Item personalizado" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.active)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(Number(p.price))}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label>Descrição</Label>
                <Input {...register(`items.${index}.description`)} placeholder="Descrição do item" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label>Qtd.</Label>
                <Input type="number" step="0.01" min="0" {...register(`items.${index}.quantity`)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Preço unit.</Label>
                <Input type="number" step="0.01" min="0" {...register(`items.${index}.unitPrice`)} />
              </div>
              <div className="flex items-center justify-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className={cn("flex flex-col items-end gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between")}>
        <div className="space-y-1 text-right">
          {discount > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Subtotal <span className="ml-2 text-foreground">{formatCurrency(itemsTotal)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Desconto <span className="ml-2 text-foreground">-{formatCurrency(discount)}</span>
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground">Total da venda</p>
          <p className="text-2xl font-semibold">{formatCurrency(total)}</p>
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {saleId ? "Salvar alterações" : "Criar venda"}
        </Button>
      </div>
    </form>
  );
}
