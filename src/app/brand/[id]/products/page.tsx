import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductsByBrand } from "@/lib/products";
import { ProductsView } from "./products-view";

export default async function BrandProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) notFound();

  const products = await getProductsByBrand(brandId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Product Intelligence
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Verified Claims & Fidelity Locks</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Product Catalog</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Define official products, verified factual claims, and reference photos for{" "}
            <Link href={`/brand/${brand.id}`} className="text-white hover:underline">
              {brand.brandName || brand.url}
            </Link>
            . Anti-hallucination fidelity locks anchor all creative generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/brand/${brand.id}`}
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-700 hover:text-white"
          >
            ← Brand DNA
          </Link>
          <Link
            href={`/brand/${brand.id}/campaigns/new`}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      <ProductsView brandId={brand.id} initialProducts={products} />
    </main>
  );
}
