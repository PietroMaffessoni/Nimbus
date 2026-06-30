import { listProducts } from "@/actions/products";
import { ProductsTable } from "@/components/produtos/products-table";

export default async function ProdutosPage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Produtos & Serviços</h2>
        <p className="text-sm text-muted-foreground">O catálogo que você usa para montar suas vendas.</p>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
