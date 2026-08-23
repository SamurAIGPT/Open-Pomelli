import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getActivityLogs } from "@/lib/activity";
import { ActivityView } from "./activity-view";

export default async function BrandActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) notFound();

  const initialLogs = await getActivityLogs(brandId, { limit: 100 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              Audit & Provenance
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Activity Log</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Audit Activity Trail</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Immutable log of generations, campaigns, human approval gate events, and imports for{" "}
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
            href={`/brand/${brand.id}/approvals`}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
          >
            Approval Queue →
          </Link>
        </div>
      </div>

      <ActivityView
        brandId={brand.id}
        initialItems={initialLogs.items}
        totalCount={initialLogs.total}
      />
    </main>
  );
}
