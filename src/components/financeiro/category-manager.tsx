"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createCategory, deleteCategory } from "@/actions/categories";

interface Category {
  id: string;
  type: "INCOME" | "EXPENSE";
  name: string;
}

function CategoryList({ type, categories }: { type: "INCOME" | "EXPENSE"; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const filtered = categories.filter((c) => c.type === type);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    const result = await createCategory({ type, name: name.trim() });
    setCreating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setName("");
    toast.success("Categoria criada.");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteCategory(deleting.id);
    setDeleteLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Categoria excluída.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
        />
        <Button type="button" onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
      ) : (
        <ul className="space-y-1">
          {filtered.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              {category.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => setDeleting(category)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Lançamentos existentes não serão afetados.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Tag className="h-4 w-4" /> Categorias
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="EXPENSE">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="EXPENSE">Despesas</TabsTrigger>
              <TabsTrigger value="INCOME">Receitas</TabsTrigger>
            </TabsList>
            <TabsContent value="EXPENSE">
              <CategoryList type="EXPENSE" categories={categories} />
            </TabsContent>
            <TabsContent value="INCOME">
              <CategoryList type="INCOME" categories={categories} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
