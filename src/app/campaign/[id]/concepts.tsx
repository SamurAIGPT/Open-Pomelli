"use client";

import { useState } from "react";
import Link from "next/link";
import { PLATFORMS } from "@/lib/platforms";
import type { CampaignConcept } from "@/lib/campaign-generator";

export type ExistingAsset = {
  id: string;
  platformId: string | null;
  platform: string;
  format: string;
  imageUrl: string | null;
  headline: string | null;
  body: string | null;
  cta: string | null;
  approval?: string;
  brandId?: string;
};

type Generation = {
  platformId: string;
  status: "queued" | "running" | "done" | "error";
  asset?: ExistingAsset;
  error?: string;
};

const CONCURRENCY = 3;

export function ConceptsPanel({
  campaignId,
  concepts,
  initialAssets,
}: {
  campaignId: string;
  concepts: CampaignConcept[];
  initialAssets: Record<number, ExistingAsset[]>;
}) {
  const [assetsByConcept, setAssetsByConcept] = useState(initialAssets);

  function appendAsset(conceptIndex: number, asset: ExistingAsset) {
    setAssetsByConcept((prev) => ({
      ...prev,
      [conceptIndex]: [...(prev[conceptIndex] ?? []), asset],
    }));
  }

  function updateAssetApproval(conceptIndex: number, assetId: string, approval: string) {
    setAssetsByConcept((prev) => ({
      ...prev,
      [conceptIndex]: (prev[conceptIndex] ?? []).map((a) =>
        a.id === assetId ? { ...a, approval } : a
      ),
    }));
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {concepts.map((c, i) => (
        <ConceptCard
          key={i}
          campaignId={campaignId}
          conceptIndex={i}
          concept={c}
          existing={assetsByConcept[i] ?? []}
          onAssetCreated={(a) => appendAsset(i, a)}
          onApprovalChange={(assetId, approval) => updateAssetApproval(i, assetId, approval)}
        />
      ))}
    </div>
  );
}

function ConceptCard({
  campaignId,
  conceptIndex,
  concept,
  existing,
  onAssetCreated,
  onApprovalChange,
}: {
  campaignId: string;
  conceptIndex: number;
  concept: CampaignConcept;
  existing: ExistingAsset[];
  onAssetCreated: (a: ExistingAsset) => void;
  onApprovalChange: (assetId: string, approval: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const recommended = new Set(concept.recommended_platforms);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const p of PLATFORMS) {
      if (recommended.has(p.platform) || recommended.has(p.id)) s.add(p.id);
    }
    if (s.size === 0) PLATFORMS.forEach((p) => s.add(p.id));
    return s;
  });
  const [gens, setGens] = useState<Record<string, Generation>>({});
  const [running, setRunning] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateOne(platformId: string): Promise<void> {
    setGens((prev) => ({ ...prev, [platformId]: { platformId, status: "running" } }));
    try {
      const res = await fetch("/api/asset/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, conceptIndex, platformId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ? JSON.stringify(json.error) : `HTTP ${res.status}`);
      const asset: ExistingAsset = {
        id: json.id,
        platformId,
        platform: PLATFORMS.find((p) => p.id === platformId)?.platform ?? platformId,
        format: PLATFORMS.find((p) => p.id === platformId)?.format ?? "",
        imageUrl: json.imageUrl,
        headline: json.headline,
        body: json.body,
        cta: json.cta,
      };
      onAssetCreated(asset);
      setGens((prev) => ({ ...prev, [platformId]: { platformId, status: "done", asset } }));
    } catch (e) {
      setGens((prev) => ({ ...prev, [platformId]: { platformId, status: "error", error: String(e) } }));
    }
  }

  async function generateAll() {
    if (selected.size === 0 || running) return;
    setRunning(true);
    const queue = [...selected];
    setGens(Object.fromEntries(queue.map((id) => [id, { platformId: id, status: "queued" as const }])));

    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const id = queue[cursor++];
        await generateOne(id);
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()));
    setRunning(false);
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <header>
        <h2 className="text-lg font-semibold">{concept.title}</h2>
        <p className="mt-1 text-sm text-neutral-400">{concept.theme}</p>
      </header>

      <div className="space-y-2 text-sm">
        <Row label="Hook" value={concept.hook} />
        <Row label="Key message" value={concept.key_message} />
        <Row label="CTA" value={concept.cta} />
        <Row label="Tone" value={concept.tone_notes} />
        <Row label="Visual" value={concept.visual_direction} />
      </div>

      {existing.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">
            Generated assets ({existing.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {existing.map((a) => (
              <AssetThumb
                key={a.id}
                asset={a}
                onApprovalChange={(status) => onApprovalChange(a.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {Object.values(gens).some((g) => g.status === "running" || g.status === "queued" || g.status === "error") && (
        <div className="space-y-1">
          {Object.values(gens).map((g) => (
            <ProgressRow key={g.platformId} gen={g} />
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-neutral-400 hover:text-white"
        >
          {open ? "Hide platforms" : "Generate assets →"}
        </button>
      </div>

      {open && (
        <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">Platforms</p>
          <div className="grid grid-cols-1 gap-1.5">
            {PLATFORMS.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="accent-white"
                  disabled={running}
                />
                <span className={selected.has(p.id) ? "" : "text-neutral-500"}>{p.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-500">{selected.size} selected</span>
            <button
              onClick={generateAll}
              disabled={running || selected.size === 0}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {running ? "Generating…" : `Generate ${selected.size}`}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function ProgressRow({ gen }: { gen: Generation }) {
  const platform = PLATFORMS.find((p) => p.id === gen.platformId);
  const color =
    gen.status === "running"
      ? "text-yellow-400"
      : gen.status === "done"
        ? "text-emerald-400"
        : gen.status === "error"
          ? "text-red-400"
          : "text-neutral-500";
  return (
    <div className="flex items-center justify-between text-xs">
      <span>{platform?.label ?? gen.platformId}</span>
      <span className={color}>
        {gen.status === "running" ? "rendering…" : gen.status}
        {gen.error && ` — ${gen.error.slice(0, 80)}`}
      </span>
    </div>
  );
}

function AssetThumb({
  asset,
  onApprovalChange,
}: {
  asset: ExistingAsset;
  onApprovalChange?: (newApproval: string) => void;
}) {
  const platform = asset.platformId ? PLATFORMS.find((p) => p.id === asset.platformId) : null;
  const [approval, setApproval] = useState(asset.approval || "PENDING");
  const [updating, setUpdating] = useState(false);

  const isApproved = approval === "APPROVED";
  const isRejected = approval === "REJECTED";

  async function updateApproval(newStatus: "APPROVED" | "REJECTED" | "PENDING", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setUpdating(true);
    try {
      const res = await fetch("/api/approval", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "asset", id: asset.id, approval: newStatus }),
      });
      if (res.ok) {
        setApproval(newStatus);
        onApprovalChange?.(newStatus);
      }
    } catch {}
    setUpdating(false);
  }

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border bg-neutral-900 transition ${
        isApproved
          ? "border-emerald-500/40 hover:border-emerald-500/60"
          : isRejected
          ? "border-rose-500/40 hover:border-rose-500/60"
          : "border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <Link href={`/asset/${asset.id}/edit`} className="block">
        <div className="relative aspect-square w-full bg-neutral-950">
          {asset.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.imageUrl} alt={asset.headline ?? ""} className="block h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">no image</div>
          )}

          {/* Status Badge */}
          <div className="absolute left-2 top-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                isApproved
                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                  : isRejected
                  ? "bg-rose-950/90 text-rose-300 border border-rose-500/40"
                  : "bg-amber-950/90 text-amber-300 border border-amber-500/40"
              }`}
            >
              {isApproved ? "✓ Approved" : isRejected ? "✕ Rejected" : "⏳ Pending"}
            </span>
          </div>
        </div>

        <div className="space-y-0.5 p-2.5 text-[11px]">
          <p className="text-neutral-400">{platform?.label ?? `${asset.platform} / ${asset.format}`}</p>
          {asset.headline && <p className="font-medium text-neutral-200 line-clamp-1">{asset.headline}</p>}
          {asset.cta && <p className="text-neutral-400">{asset.cta}</p>}
        </div>
      </Link>

      {/* Approval & Action Bar */}
      <div className="flex items-center justify-between border-t border-neutral-800/80 bg-neutral-950/60 px-2.5 py-1.5 text-[10px]">
        <div className="flex items-center gap-1">
          {!isApproved && (
            <button
              onClick={(e) => updateApproval("APPROVED", e)}
              disabled={updating}
              className="rounded bg-emerald-600/80 px-1.5 py-0.5 font-medium text-white hover:bg-emerald-500"
            >
              Approve
            </button>
          )}
          {!isRejected && (
            <button
              onClick={(e) => updateApproval("REJECTED", e)}
              disabled={updating}
              className="rounded border border-neutral-700 px-1.5 py-0.5 font-medium text-rose-400 hover:bg-rose-950/40"
            >
              Reject
            </button>
          )}
        </div>

        {asset.imageUrl && (
          isApproved ? (
            <Link
              href={`/animate?image=${encodeURIComponent(asset.imageUrl)}&sourceType=asset&sourceId=${asset.id}${
                asset.brandId ? `&brandId=${asset.brandId}` : ""
              }`}
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Animate →
            </Link>
          ) : (
            <span
              title="Approve this image first to unlock video animation"
              className="inline-flex items-center gap-0.5 text-neutral-500"
            >
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Gated
            </span>
          )
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</span>
      <p className="mt-0.5 text-sm leading-snug text-neutral-200">{value}</p>
    </div>
  );
}
