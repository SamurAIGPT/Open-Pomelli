"use client";

import { useState } from "react";
import { CATEGORY_BADGES, type ActivityActor, type ActivityCategory } from "@/lib/activity";

export interface ActivityItem {
  id: string;
  brandId?: string | null;
  actor: string;
  action: string;
  category: string;
  detail: string;
  metadata?: string | null;
  createdAt: Date | string;
}

const ACTOR_LABELS: Record<string, { label: string; badge: string }> = {
  user: { label: "Human User", badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  "ai-agent": { label: "AI Agent", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  "gate-keeper": { label: "Gatekeeper", badge: "bg-red-500/10 text-red-300 border-red-500/20" },
  system: { label: "System", badge: "bg-neutral-800 text-neutral-300 border-neutral-700" },
};

export function ActivityView({
  brandId,
  initialItems,
  totalCount,
}: {
  brandId?: string | null;
  initialItems: ActivityItem[];
  totalCount: number;
}) {
  const [items] = useState<ActivityItem[]>(initialItems);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (actorFilter !== "all" && item.actor !== actorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetail = item.detail.toLowerCase().includes(q);
      const matchAction = item.action.toLowerCase().includes(q);
      const matchMetadata = item.metadata ? item.metadata.toLowerCase().includes(q) : false;
      if (!matchDetail && !matchAction && !matchMetadata) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Search Control Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-neutral-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-neutral-600"
          >
            <option value="all">All Categories</option>
            <option value="governance">Governance & Gates</option>
            <option value="generation">AI Generations</option>
            <option value="campaign">Campaigns</option>
            <option value="calendar">Opportunities & Calendar</option>
            <option value="brand">Brand DNA</option>
            <option value="general">General</option>
          </select>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-neutral-600"
          >
            <option value="all">All Actors</option>
            <option value="user">Human User</option>
            <option value="ai-agent">AI Agent</option>
            <option value="gate-keeper">Gatekeeper</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="text-xs text-neutral-400">
          Showing <strong>{filteredItems.length}</strong> of <strong>{totalCount}</strong> logs
        </div>
      </div>

      {/* Timeline View */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-medium text-white">No activity logs match your filters</h3>
          <p className="mt-1 text-xs text-neutral-400">
            Actions, approvals, generations, and gate checks will automatically record here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((log) => {
            const cat =
              CATEGORY_BADGES[log.category as ActivityCategory] || CATEGORY_BADGES.general;
            const actorInfo = ACTOR_LABELS[log.actor] || ACTOR_LABELS.system;
            const isExpanded = expandedId === log.id;
            let formattedMetadata: string | null = null;
            if (log.metadata) {
              try {
                formattedMetadata = JSON.stringify(JSON.parse(log.metadata), null, 2);
              } catch {
                formattedMetadata = log.metadata;
              }
            }

            return (
              <div
                key={log.id}
                className={`rounded-xl border bg-neutral-950 p-4 transition ${
                  log.action === "gate_blocked"
                    ? "border-red-800/40 bg-red-950/10"
                    : log.action.includes("approve")
                    ? "border-emerald-800/40"
                    : "border-neutral-800/80 hover:border-neutral-700"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-sm">
                      {cat.icon}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cat.bg} ${cat.text} ${cat.border}`}
                        >
                          {cat.label}
                        </span>

                        <span
                          className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-medium ${actorInfo.badge}`}
                        >
                          {actorInfo.label}
                        </span>

                        <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
                          {log.action}
                        </code>
                      </div>

                      <p className="mt-1.5 text-sm font-medium text-neutral-100 leading-snug">
                        {log.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-neutral-500 sm:text-right">
                    <span title={new Date(log.createdAt).toLocaleString()}>
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                      {" · "}
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>

                    {formattedMetadata && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] text-neutral-400 hover:text-white transition"
                      >
                        {isExpanded ? "Hide Data" : "Inspect →"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Metadata Drawer */}
                {isExpanded && formattedMetadata && (
                  <div className="mt-3.5 border-t border-neutral-800/80 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Event Provenance & Metadata Payload
                      </span>
                    </div>
                    <pre className="max-h-60 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/80 p-3 font-mono text-[11px] leading-relaxed text-neutral-300">
                      {formattedMetadata}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
