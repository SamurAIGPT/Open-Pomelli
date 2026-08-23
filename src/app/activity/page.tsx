import { getActivityLogs } from "@/lib/activity";
import Link from "next/link";
import { ActivityView } from "../brand/[id]/activity/activity-view";

export default async function GlobalActivityPage() {
  const initialLogs = await getActivityLogs(null, { limit: 100 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
              Workspace Provenance
            </span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Global Audit Log</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Audit Activity Log</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time feed of all agent generations, human approval gate events, and campaign actions across all brands.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-700 hover:text-white"
          >
            ← Home
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/20"
          >
            Marketing Calendar →
          </Link>
        </div>
      </div>

      <ActivityView
        brandId={null}
        initialItems={initialLogs.items}
        totalCount={initialLogs.total}
      />
    </main>
  );
}
