import Link from "next/link";
import { calendarService } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";

const CATEGORY_STYLES: Record<string, { badge: string; border: string }> = {
  shopping: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
  },
  holiday: {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    border: "border-rose-500/20 hover:border-rose-500/40",
  },
  cultural: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  seasonal: {
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    border: "border-sky-500/20 hover:border-sky-500/40",
  },
};

export default async function GlobalCalendarPage() {
  const [events, brands] = await Promise.all([
    calendarService.allEvents(),
    prisma.brandDNA.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              Intelligence
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Global Marketing Calendar</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Marketing Calendar 2026–2027</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Key shopping days, seasonal shifts, holidays, and cultural moments to anchor marketing campaigns.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-700 hover:text-white"
        >
          ← Home
        </Link>
      </div>

      {brands.length > 0 && (
        <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Scan with your Brand DNA:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/brand/${b.id}/opportunities`}
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-300"
              >
                {b.brandName || b.url} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const days = event.daysAway;
          const catStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.holiday;
          return (
            <div
              key={event.id}
              className={`flex flex-col justify-between rounded-xl border bg-neutral-950 p-5 transition ${catStyle.border}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${catStyle.badge}`}
                  >
                    {event.category}
                  </span>
                  <span className="text-xs font-medium text-neutral-400">
                    {days === 0
                      ? "Today"
                      : days === 1
                      ? "Tomorrow"
                      : days < 0
                      ? "Passed"
                      : `In ${days} days`}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-white">{event.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {event.description && (
                  <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                    {event.description}
                  </p>
                )}
              </div>

              {brands.length > 0 && (
                <div className="mt-5 border-t border-neutral-900 pt-3">
                  <Link
                    href={`/brand/${brands[0].id}/opportunities`}
                    className="text-xs text-neutral-400 hover:text-white transition"
                  >
                    Check Brand Opportunities →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
