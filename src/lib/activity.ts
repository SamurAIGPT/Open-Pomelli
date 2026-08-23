import { prisma } from "./prisma";

export type ActivityCategory =
  | "governance"
  | "generation"
  | "campaign"
  | "brand"
  | "calendar"
  | "general";

export type ActivityActor = "user" | "ai-agent" | "system" | "gate-keeper";

export interface LogActivityParams {
  brandId?: string | null;
  actor?: ActivityActor;
  action: string;
  category?: ActivityCategory;
  detail: string;
  metadata?: Record<string, unknown> | null;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const entry = await prisma.activityLog.create({
      data: {
        brandId: params.brandId ?? null,
        actor: params.actor ?? "user",
        action: params.action,
        category: params.category ?? "general",
        detail: params.detail,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
    return entry;
  } catch (error) {
    // Non-blocking logger to ensure core user flows never crash if logging fails
    console.error("Failed to write activity log:", error);
    return null;
  }
}

export interface ActivityFilterOptions {
  category?: ActivityCategory | "all";
  actor?: ActivityActor | "all";
  limit?: number;
  offset?: number;
}

export async function getActivityLogs(
  brandId?: string | null,
  opts: ActivityFilterOptions = {}
) {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const where: Record<string, unknown> = {};
  if (brandId) where.brandId = brandId;
  if (opts.category && opts.category !== "all") where.category = opts.category;
  if (opts.actor && opts.actor !== "all") where.actor = opts.actor;

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { brand: { select: { id: true, brandName: true, url: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items, total };
}

export const CATEGORY_BADGES: Record<
  ActivityCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  governance: {
    label: "Governance",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: "🛡️",
  },
  generation: {
    label: "Generation",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    icon: "✨",
  },
  campaign: {
    label: "Campaign",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    icon: "🚀",
  },
  calendar: {
    label: "Calendar",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: "📅",
  },
  brand: {
    label: "Brand DNA",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
    icon: "🎨",
  },
  general: {
    label: "General",
    bg: "bg-neutral-800",
    text: "text-neutral-300",
    border: "border-neutral-700",
    icon: "📝",
  },
};
