import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBrandApprovalQueue } from "@/lib/approvals";
import { ApprovalsView } from "./approvals-view";

export default async function BrandApprovalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) notFound();

  const initialQueue = await getBrandApprovalQueue(brandId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Governance & Gates
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Human Approval Queue</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Approval Review Queue</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review and gate campaign images, photoshoot outputs, and videos for{" "}
            <Link href={`/brand/${brand.id}`} className="text-white hover:underline">
              {brand.brandName || brand.url}
            </Link>
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

      <ApprovalsView
        brandId={brand.id}
        initialItems={initialQueue.items}
        initialCounts={initialQueue.counts}
      />
    </main>
  );
}
