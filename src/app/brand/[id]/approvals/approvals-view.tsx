"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApprovalQueueItem, ApprovalStatus, CreativesType } from "@/lib/approvals";

export function ApprovalsView({
  brandId,
  initialItems,
  initialCounts,
}: {
  brandId: string;
  initialItems: ApprovalQueueItem[];
  initialCounts: { pending: number; approved: number; rejected: number; total: number };
}) {
  const [items, setItems] = useState<ApprovalQueueItem[]>(initialItems);
  const [counts, setCounts] = useState(initialCounts);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [typeFilter, setTypeFilter] = useState<"all" | CreativesType>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSetApproval(type: CreativesType, id: string, nextStatus: ApprovalStatus) {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/approval", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, approval: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update approval status");

      setItems((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, approval: nextStatus } : item));
        setCounts({
          pending: next.filter((i) => i.approval === "PENDING").length,
          approved: next.filter((i) => i.approval === "APPROVED").length,
          rejected: next.filter((i) => i.approval === "REJECTED").length,
          total: next.length,
        });
        return next;
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setUpdatingId(null);
    }
  }

  const displayedItems = items
    .filter((item) => (activeTab === "ALL" ? true : item.approval === activeTab))
    .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter));

  return (
    <div className="space-y-6">
      {/* Control Bar & Tabs */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "PENDING"
                ? "bg-amber-500 text-black font-semibold"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Pending Review
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "PENDING" ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "APPROVED"
                ? "bg-emerald-500 text-black font-semibold"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Approved
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "APPROVED" ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("REJECTED")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "REJECTED"
                ? "bg-rose-500 text-white font-semibold"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Rejected
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "REJECTED" ? "bg-white/20 text-white" : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {counts.rejected}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "ALL"
                ? "bg-white text-black font-semibold"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            All Creatives ({counts.total})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | CreativesType)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-neutral-600"
          >
            <option value="all">All Formats & Sources</option>
            <option value="asset">Campaign Creatives</option>
            <option value="photoshoot">Product Photoshoots</option>
            <option value="animation">Animated Videos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Grid of Creatives */}
      {displayedItems.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-medium text-white">
            {activeTab === "PENDING"
              ? "All caught up! No items pending review"
              : activeTab === "APPROVED"
              ? "No approved assets yet"
              : activeTab === "REJECTED"
              ? "No rejected assets"
              : "No assets found"}
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            {activeTab === "PENDING"
              ? "Generated campaign assets, photoshoots, and videos will land here for your sign-off."
              : "Items will appear here once reviewed."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedItems.map((item) => {
            const isUpdating = updatingId === item.id;
            const isApproved = item.approval === "APPROVED";
            const isRejected = item.approval === "REJECTED";
            const isPending = item.approval === "PENDING";

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between overflow-hidden rounded-xl border bg-neutral-950 transition ${
                  isApproved
                    ? "border-emerald-500/30 hover:border-emerald-500/50"
                    : isRejected
                    ? "border-rose-500/30 hover:border-rose-500/50"
                    : "border-amber-500/30 hover:border-amber-500/50"
                }`}
              >
                {/* Media Preview */}
                <div className="relative aspect-square w-full bg-neutral-900">
                  {item.mediaUrl ? (
                    item.kind === "video" ? (
                      <video
                        src={item.mediaUrl}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      No Media Preview
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-md backdrop-blur-md ${
                        isApproved
                          ? "bg-emerald-950/90 border border-emerald-500/40 text-emerald-300"
                          : isRejected
                          ? "bg-rose-950/90 border border-rose-500/40 text-rose-300"
                          : "bg-amber-950/90 border border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {isApproved ? "✓ Approved" : isRejected ? "✕ Rejected" : "⏳ Pending Review"}
                    </span>
                  </div>

                  {/* Format Pill */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-neutral-300 backdrop-blur-sm">
                      {item.type === "asset"
                        ? item.platform || "Asset"
                        : item.type === "photoshoot"
                        ? "Photo Studio"
                        : "Video"}
                    </span>
                  </div>
                </div>

                {/* Card Metadata */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h4 className="font-medium text-sm text-neutral-100 line-clamp-1">{item.title}</h4>
                    <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">{item.subtitle}</p>
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Gate State & Actions */}
                  <div className="mt-4 pt-3 border-t border-neutral-900">
                    <div className="flex items-center justify-between gap-2">
                      {/* Approval Actions */}
                      <div className="flex items-center gap-1.5">
                        {!isApproved && (
                          <button
                            onClick={() => handleSetApproval(item.type, item.id, "APPROVED")}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {!isRejected && (
                          <button
                            onClick={() => handleSetApproval(item.type, item.id, "REJECTED")}
                            disabled={isUpdating}
                            className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:border-rose-800/60 hover:bg-rose-950/30 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {!isPending && (
                          <button
                            onClick={() => handleSetApproval(item.type, item.id, "PENDING")}
                            disabled={isUpdating}
                            className="text-[11px] text-neutral-500 transition hover:text-neutral-300"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Contextual Link */}
                      {item.type === "asset" && (
                        <Link
                          href={`/asset/${item.id}/edit`}
                          className="text-xs text-neutral-400 hover:text-white transition"
                        >
                          Canvas Editor →
                        </Link>
                      )}

                      {/* If Image is Approved, unlock Animate Video */}
                      {item.kind === "image" && item.mediaUrl && (
                        isApproved ? (
                          <Link
                            href={`/animate?image=${encodeURIComponent(
                              item.mediaUrl
                            )}&sourceType=${item.type}&sourceId=${item.id}&brandId=${brandId}`}
                            className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-[11px] font-medium text-amber-300 transition hover:border-amber-500 hover:bg-neutral-700"
                          >
                            Animate Video →
                          </Link>
                        ) : (
                          <span
                            title="Video generation is locked until approved by a human"
                            className="inline-flex items-center gap-1 text-[10px] text-neutral-500 cursor-not-allowed"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Video Gated
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
