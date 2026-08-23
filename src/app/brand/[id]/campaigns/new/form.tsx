"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CAMPAIGN_GOALS, type CampaignGoal } from "@/lib/campaign-generator";
import type { ProductItem } from "@/lib/products";

function FormContent({
  brandId,
  products = [],
}: {
  brandId: string;
  products?: ProductItem[];
}) {
  const searchParams = useSearchParams();
  const initialGoal = (searchParams.get("goal") as CampaignGoal) || "product_launch";
  const initialPrompt = searchParams.get("prompt") || "";
  const initialProductId = searchParams.get("productId") || "";
  const eventId = searchParams.get("eventId") || null;
  const opportunityId = searchParams.get("opportunityId") || null;

  const [goal, setGoal] = useState<CampaignGoal>(
    CAMPAIGN_GOALS.some((g) => g.value === initialGoal) ? initialGoal : "product_launch"
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const activeProduct = products.find((p) => p.id === selectedProductId) || null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaign/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          goal,
          prompt: prompt.trim() || null,
          eventId,
          opportunityId,
          productId: selectedProductId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ? JSON.stringify(json.error) : `HTTP ${res.status}`);
      router.push(`/campaign/${json.id}`);
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Target Product Selector */}
      {products.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
              <span>📦</span> Target Product & Verified Claims
            </span>
            {activeProduct?.fidelityLock && (
              <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                🔒 Fidelity Lock Active
              </span>
            )}
          </div>

          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
          >
            <option value="">-- General Brand Campaign (No Specific Product) --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.currency} {p.price.toFixed(2)} ({p.claims.length} verified claims)
              </option>
            ))}
          </select>

          {activeProduct && (
            <div className="mt-3 space-y-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-xs">
              <p className="text-neutral-300 font-medium">{activeProduct.name}</p>
              <p className="text-neutral-400 text-[11px] line-clamp-2">{activeProduct.description}</p>
              {activeProduct.claims.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeProduct.claims.map((c, i) => (
                    <span key={i} className="rounded bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <span className="mb-3 block text-xs uppercase tracking-wider text-neutral-500">Goal</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CAMPAIGN_GOALS.map((g) => {
            const selected = g.value === goal;
            return (
              <label
                key={g.value}
                className={`cursor-pointer rounded-lg border p-3 transition ${
                  selected
                    ? "border-white bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  value={g.value}
                  checked={selected}
                  onChange={() => setGoal(g.value)}
                  className="sr-only"
                />
                <div className="text-sm font-medium">{g.label}</div>
                <div className="mt-0.5 text-xs text-neutral-500">{g.description}</div>
              </label>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">
          Custom direction (optional)
        </span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. focus on the new pricing tier, target indie devs, summer angle"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </label>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? "Generating concepts…" : "Generate 4 concepts"}
        </button>
      </div>
    </form>
  );
}

export function NewCampaignForm({
  brandId,
  products = [],
}: {
  brandId: string;
  products?: ProductItem[];
}) {
  return (
    <Suspense fallback={<div className="text-sm text-neutral-400">Loading campaign form...</div>}>
      <FormContent brandId={brandId} products={products} />
    </Suspense>
  );
}
