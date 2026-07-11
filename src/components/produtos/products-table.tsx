"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { ProductForm } from "@/components/produtos/product-form";
import { deleteProduct } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: unknown;
  type: "PRODUCT" | "SERVICE";
  active: boolean;
}

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteProduct(deleting.id);
    setDeleteLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item removido.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar produto ou serviço..." className="pl-9" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo item
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search ? "Nenhum item encontrado" : "Nenhum produto ou serviço cadastrado"}
          description={search ? "Tente buscar com outro termo." : "Cadastre seus produtos e serviços para usá-los nas vendas."}
          action={
            !search && (
              <Button onClick={openNew} size="sm">
                <Plus className="h-4 w-4" /> Novo item
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  {product.description && <div className="text-xs text-muted-foreground">{product.description}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.type === "PRODUCT" ? "Produto" : "Serviço"}</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(Number(product.price))}</TableCell>
                <TableCell>
                  <Badge variant={product.active ? "success" : "secondary"}>{product.active ? "Ativo" : "Inativo"}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(product)}>
                        <Pencil className="mr-1 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(product)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            key={editing?.id ?? "new"}
            productId={editing?.id}
            defaultValues={editing ? { ...editing, price: Number(editing.price), description: editing.description ?? "" } : undefined}
            onSuccess={() => {
              setFormOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir item"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Itens já usados em vendas serão apenas desativados.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
