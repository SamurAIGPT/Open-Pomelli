import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OpportunitiesView } from "./opportunities-view";
import { calendarService } from "@/lib/calendar";

export default async function BrandOpportunitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [brand, opportunities] = await Promise.all([
    prisma.brandDNA.findUnique({ where: { id } }),
    prisma.opportunity.findMany({
      where: { brandId: id },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  if (!brand) notFound();

  const calendarEvents = calendarService.allEvents();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              Intelligence
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Marketing Calendar</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Campaign Opportunities</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Timely marketing moments matched to{" "}
            <Link href={`/brand/${brand.id}`} className="text-white hover:underline">
              {brand.brandName || brand.url}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/brand/${brand.id}`}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-700 hover:text-white"
          >
            ← Brand DNA
          </Link>
          <Link
            href={`/brand/${brand.id}/campaigns/new`}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            + Custom Campaign
          </Link>
        </div>
      </div>

      <OpportunitiesView
        brandId={brand.id}
        initialOpportunities={opportunities}
        calendarEvents={calendarEvents}
      />
    </main>
  );
}
