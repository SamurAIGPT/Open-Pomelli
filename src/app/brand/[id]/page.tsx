import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DnaEditor, type EditableDNA } from "./editor";
import { CAMPAIGN_GOALS } from "@/lib/campaign-generator";

import { daysUntil } from "@/lib/calendar";

function parseList(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dna, campaigns, opportunities, pendingAssetsCount] = await Promise.all([
    prisma.brandDNA.findUnique({ where: { id } }),
    prisma.campaign.findMany({
      where: { brandId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.opportunity.findMany({
      where: { brandId: id, status: "new" },
      orderBy: { eventDate: "asc" },
      take: 3,
    }),
    prisma.asset.count({
      where: { campaign: { brandId: id }, approval: "PENDING" },
    }),
  ]);
  if (!dna) notFound();

  const initial: EditableDNA = {
    brandName: dna.brandName ?? "",
    industry: dna.industry ?? "",
    tagline: dna.tagline ?? "",
    valueProposition: dna.valueProposition ?? "",
    targetAudience: dna.targetAudience ?? "",
    imageryStyle: dna.imageryStyle ?? "",
    layoutStyle: dna.layoutStyle ?? "",
    logoUrl: dna.logoUrl ?? null,
    screenshotUrl: dna.screenshotUrl ?? null,
    toneOfVoice: parseList(dna.toneOfVoice),
    brandPersonality: parseList(dna.brandPersonality),
    keyMessages: parseList(dna.keyMessages),
    fonts: parseList(dna.fonts),
    primaryColors: parseList(dna.primaryColors),
    secondaryColors: parseList(dna.secondaryColors),
  };

  return (
    <>
      <DnaEditor id={dna.id} sourceUrl={dna.url} initial={initial} />

      {pendingAssetsCount > 0 && (
        <section className="mx-auto mb-6 max-w-4xl px-6">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  {pendingAssetsCount} Creative{pendingAssetsCount === 1 ? "" : "s"} Pending Human Review
                </p>
                <p className="text-xs text-neutral-400">
                  Review and sign off on assets before publishing or unlocking video generation.
                </p>
              </div>
            </div>
            <Link
              href={`/brand/${dna.id}/approvals`}
              className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition"
            >
              Open Queue →
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Opportunities Widget */}
      <section className="mx-auto mb-8 max-w-4xl px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Upcoming Opportunities
          </h2>
          <Link
            href={`/brand/${dna.id}/opportunities`}
            className="text-xs text-neutral-400 hover:text-white transition"
          >
            View Calendar & All Opportunities ({opportunities.length > 0 ? `${opportunities.length} upcoming` : "Scan"}) →
          </Link>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {opportunities.map((opp) => {
              const days = daysUntil(opp.eventDate);
              return (
                <Link
                  key={opp.id}
                  href={`/brand/${dna.id}/opportunities`}
                  className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700 hover:bg-neutral-900/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-semibold uppercase tracking-wider text-amber-400">
                        {opp.category}
                      </span>
                      <span className="text-neutral-400">
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-amber-300 transition">
                      {opp.eventName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                      {opp.angle}
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-medium text-neutral-500 group-hover:text-neutral-300">
                    Review opportunity →
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-400">
            <span>Scan the next 90 days against your Brand DNA to discover seasonal and holiday campaign moments.</span>
            <Link
              href={`/brand/${dna.id}/opportunities`}
              className="ml-4 shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 font-medium text-white hover:bg-neutral-700 transition"
            >
              Scan Calendar
            </Link>
          </div>
        )}
      </section>

      {campaigns.length > 0 && (
        <section className="mx-auto mb-12 max-w-4xl px-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Past campaigns
          </h2>
          <ul className="divide-y divide-neutral-900 rounded-xl border border-neutral-800 bg-neutral-950">
            {campaigns.map((c) => {
              const label = CAMPAIGN_GOALS.find((g) => g.value === c.goal)?.label ?? c.goal;
              return (
                <li key={c.id}>
                  <Link
                    href={`/campaign/${c.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-900"
                  >
                    <span>
                      <span className="font-medium">{label}</span>
                      {c.prompt && (
                        <span className="ml-2 text-neutral-500">— {c.prompt}</span>
                      )}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {c.createdAt.toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
