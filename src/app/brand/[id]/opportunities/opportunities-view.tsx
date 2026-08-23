"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type UpcomingMarketingEvent, daysUntil } from "@/lib/calendar";

export interface OpportunityItem {
  id: string;
  brandId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  category: string;
  angle: string;
  suggestedOffer: string | null;
  priority: string;
  status: string;
  createdAt: Date | string;
}

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

const PRIORITY_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: "High Priority", bg: "bg-red-950/80 border-red-800/80", text: "text-red-300" },
  medium: { label: "Medium", bg: "bg-amber-950/60 border-amber-800/60", text: "text-amber-300" },
  low: { label: "Low", bg: "bg-neutral-800/60 border-neutral-700/60", text: "text-neutral-400" },
};

export function OpportunitiesView({
  brandId,
  initialOpportunities,
  calendarEvents,
}: {
  brandId: string;
  initialOpportunities: OpportunityItem[];
  calendarEvents: UpcomingMarketingEvent[];
}) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(initialOpportunities);
  const [scanning, setScanning] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "converted" | "dismissed" | "calendar">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch(`/api/brand/${brandId}/opportunities`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan opportunities");
      setOpportunities(data.opportunities);
    } catch (e) {
      setError(String(e));
    } finally {
      setScanning(false);
    }
  }

  async function handleConvert(oppId: string) {
    setConvertingId(oppId);
    setError(null);
    try {
      const res = await fetch(`/api/brand/${brandId}/opportunities/${oppId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert opportunity");
      router.push(`/campaign/${data.campaignId}`);
    } catch (e) {
      setError(String(e));
      setConvertingId(null);
    }
  }

  async function handleDismiss(oppId: string, dismiss: boolean) {
    try {
      const nextStatus = dismiss ? "dismissed" : "new";
      const res = await fetch(`/api/brand/${brandId}/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update opportunity");

      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, status: nextStatus } : o))
      );
    } catch (e) {
      setError(String(e));
    }
  }

  const activeOpps = opportunities.filter((o) => o.status === "new");
  const convertedOpps = opportunities.filter((o) => o.status === "converted");
  const dismissedOpps = opportunities.filter((o) => o.status === "dismissed");

  const displayedOpportunities = (
    activeTab === "active"
      ? activeOpps
      : activeTab === "converted"
      ? convertedOpps
      : activeTab === "dismissed"
      ? dismissedOpps
      : []
  ).filter((o) => categoryFilter === "all" || o.category === categoryFilter);

  const displayedCalendar = calendarEvents.filter(
    (e) => categoryFilter === "all" || e.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "active"
                ? "bg-white text-black"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Active Opportunities ({activeOpps.length})
          </button>
          <button
            onClick={() => setActiveTab("converted")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "converted"
                ? "bg-white text-black"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Converted ({convertedOpps.length})
          </button>
          {dismissedOpps.length > 0 && (
            <button
              onClick={() => setActiveTab("dismissed")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "dismissed"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              Dismissed ({dismissedOpps.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab("calendar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "calendar"
                ? "bg-white text-black"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            12-Month Calendar ({calendarEvents.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 outline-none focus:border-neutral-600"
          >
            <option value="all">All Categories</option>
            <option value="shopping">Shopping Days</option>
            <option value="holiday">Holidays</option>
            <option value="cultural">Cultural Moments</option>
            <option value="seasonal">Seasonal Shifts</option>
          </select>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {scanning ? "Scanning..." : "Scan Events"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === "calendar" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
            Full marketing calendar containing key commercial, seasonal, and cultural dates. Matched events will automatically appear under <strong>Active Opportunities</strong>.
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedCalendar.map((event) => {
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

                  <div className="mt-5 pt-3 border-t border-neutral-900 flex justify-end">
                    <Link
                      href={`/brand/${brandId}/campaigns/new?eventId=${event.id}&prompt=${encodeURIComponent(
                        `Campaign for ${event.name}`
                      )}&goal=${event.category === "shopping" ? "sales" : "brand_awareness"}`}
                      className="text-xs text-neutral-400 hover:text-white transition"
                    >
                      Create campaign →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : displayedOpportunities.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-medium text-white">
            {activeTab === "active"
              ? "No upcoming opportunities found"
              : activeTab === "converted"
              ? "No converted campaigns yet"
              : "No dismissed opportunities"}
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            {activeTab === "active"
              ? "Click 'Scan Events' above to analyze the next 90 days against your Brand DNA."
              : "Opportunities you act on will appear here."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-neutral-200"
            >
              {scanning ? "Scanning..." : "Run Opportunity Scan"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {displayedOpportunities.map((opp) => {
            const days = daysUntil(opp.eventDate);
            const priorityInfo = PRIORITY_BADGES[opp.priority] || PRIORITY_BADGES.medium;
            const catStyle = CATEGORY_STYLES[opp.category] || CATEGORY_STYLES.holiday;
            const isConverting = convertingId === opp.id;

            return (
              <div
                key={opp.id}
                className={`flex flex-col justify-between rounded-xl border bg-neutral-950 p-6 transition ${catStyle.border}`}
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${catStyle.badge}`}
                      >
                        {opp.category}
                      </span>
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-medium ${priorityInfo.bg} ${priorityInfo.text}`}
                      >
                        {priorityInfo.label}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-neutral-300">
                      {days === 0
                        ? "Today"
                        : days === 1
                        ? "Tomorrow"
                        : days < 0
                        ? "Passed"
                        : `In ${days} days`}
                    </span>
                  </div>

                  {/* Title & Event Date */}
                  <h3 className="mt-4 text-xl font-semibold text-white">{opp.eventName}</h3>
                  <p className="text-xs text-neutral-500">
                    Target Date:{" "}
                    {new Date(opp.eventDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  {/* Strategic Angle Box */}
                  <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Strategic Angle
                    </span>
                    <p className="mt-1 text-sm font-medium leading-snug text-neutral-200">
                      “{opp.angle}”
                    </p>
                  </div>

                  {/* Suggested Offer Box */}
                  {opp.suggestedOffer && (
                    <div className="mt-2.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 p-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Suggested Offer / Promo
                      </span>
                      <p className="mt-0.5 text-xs text-emerald-400 font-medium">
                        {opp.suggestedOffer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between border-t border-neutral-900 pt-4">
                  {opp.status === "new" ? (
                    <>
                      <button
                        onClick={() => handleDismiss(opp.id, true)}
                        className="text-xs text-neutral-500 transition hover:text-neutral-300"
                      >
                        Dismiss
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/brand/${brandId}/campaigns/new?eventId=${opp.eventId}&prompt=${encodeURIComponent(
                            `Event: ${opp.eventName}. Angle: ${opp.angle}. Offer: ${opp.suggestedOffer || ""}`
                          )}&goal=${opp.category === "shopping" ? "sales" : "brand_awareness"}`}
                          className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-600 hover:text-white"
                        >
                          Customize
                        </Link>
                        <button
                          onClick={() => handleConvert(opp.id)}
                          disabled={isConverting}
                          className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                        >
                          {isConverting ? (
                            <>
                              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>Launch Campaign →</>
                          )}
                        </button>
                      </div>
                    </>
                  ) : opp.status === "converted" ? (
                    <div className="flex w-full items-center justify-between text-xs text-emerald-400">
                      <span>✓ Campaign generated from opportunity</span>
                      <Link
                        href={`/brand/${brandId}/campaigns/new`}
                        className="text-neutral-400 hover:text-white"
                      >
                        Create another →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between text-xs text-neutral-500">
                      <span>Dismissed</span>
                      <button
                        onClick={() => handleDismiss(opp.id, false)}
                        className="text-neutral-300 hover:text-white"
                      >
                        Restore to Active
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
