import { prisma } from "./prisma";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CreativesType = "asset" | "photoshoot" | "animation";

export class GatePreconditionError extends Error {
  code = "GATE_PRECONDITION_FAILED";
  status = 422;
  sourceType: string;
  sourceId: string | null;
  currentApproval: string;

  constructor(sourceType: string, sourceId: string | null, currentApproval: string) {
    super(
      `Human Approval Gate: Video generation requires an APPROVED source image. The source ${sourceType} (${sourceId || "untracked"}) is currently "${currentApproval}". Please approve it first.`
    );
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.currentApproval = currentApproval;
  }
}

/**
 * Enforces that a source image must have an APPROVED status before it can be converted to video.
 * Enforced on the server so no agent or client can bypass it.
 */
export async function requireApprovedSourceImage(
  sourceType: "asset" | "photoshoot" | "upload",
  sourceId?: string | null,
  sourceImageUrl?: string
): Promise<void> {
  if (sourceType === "asset" && sourceId) {
    const asset = await prisma.asset.findUnique({ where: { id: sourceId } });
    if (!asset) {
      throw new Error(`Asset not found: ${sourceId}`);
    }
    if (asset.approval !== "APPROVED") {
      throw new GatePreconditionError("campaign asset", asset.id, asset.approval);
    }
    return;
  }

  if (sourceType === "photoshoot" && sourceId) {
    const photoshoot = await prisma.photoshoot.findUnique({ where: { id: sourceId } });
    if (!photoshoot) {
      throw new Error(`Photoshoot not found: ${sourceId}`);
    }
    if (photoshoot.approval !== "APPROVED") {
      throw new GatePreconditionError("photoshoot", photoshoot.id, photoshoot.approval);
    }
    return;
  }

  // If sourceId is not given, but sourceImageUrl matches an existing asset in DB:
  if (sourceImageUrl) {
    const matchedAsset = await prisma.asset.findFirst({ where: { imageUrl: sourceImageUrl } });
    if (matchedAsset && matchedAsset.approval !== "APPROVED") {
      throw new GatePreconditionError("campaign asset", matchedAsset.id, matchedAsset.approval);
    }
    const matchedPhotoshoot = await prisma.photoshoot.findFirst({ where: { imageUrl: sourceImageUrl } });
    if (matchedPhotoshoot && matchedPhotoshoot.approval !== "APPROVED") {
      throw new GatePreconditionError("photoshoot", matchedPhotoshoot.id, matchedPhotoshoot.approval);
    }
  }
}

export async function setItemApproval(
  type: CreativesType,
  id: string,
  approval: ApprovalStatus
) {
  if (type === "asset") {
    return prisma.asset.update({ where: { id }, data: { approval } });
  }
  if (type === "photoshoot") {
    return prisma.photoshoot.update({ where: { id }, data: { approval } });
  }
  if (type === "animation") {
    return prisma.animation.update({ where: { id }, data: { approval } });
  }
  throw new Error(`Invalid item type: ${type}`);
}

export interface ApprovalQueueItem {
  id: string;
  type: CreativesType;
  kind: "image" | "video";
  title: string;
  subtitle: string;
  mediaUrl: string | null;
  approval: ApprovalStatus;
  createdAt: Date;
  brandId?: string | null;
  campaignId?: string | null;
  platform?: string | null;
  format?: string | null;
}

export async function getBrandApprovalQueue(brandId: string) {
  const [campaigns, photoshoots, animations] = await Promise.all([
    prisma.campaign.findMany({
      where: { brandId },
      include: { assets: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.photoshoot.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.animation.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const items: ApprovalQueueItem[] = [];

  for (const c of campaigns) {
    for (const a of c.assets) {
      items.push({
        id: a.id,
        type: "asset",
        kind: a.videoUrl ? "video" : "image",
        title: a.headline || `${a.platform} / ${a.format}`,
        subtitle: `${c.goal} Campaign • ${a.platform} (${a.format})`,
        mediaUrl: a.videoUrl || a.imageUrl,
        approval: (a.approval as ApprovalStatus) || "PENDING",
        createdAt: a.createdAt,
        brandId,
        campaignId: c.id,
        platform: a.platform,
        format: a.format,
      });
    }
  }

  for (const p of photoshoots) {
    items.push({
      id: p.id,
      type: "photoshoot",
      kind: "image",
      title: `${p.styleLabel} Photoshoot`,
      subtitle: `${p.category} • ${p.aspect} (${p.resolution})`,
      mediaUrl: p.imageUrl,
      approval: (p.approval as ApprovalStatus) || "PENDING",
      createdAt: p.createdAt,
      brandId,
    });
  }

  for (const an of animations) {
    items.push({
      id: an.id,
      type: "animation",
      kind: "video",
      title: `Animated Video (${an.duration}s)`,
      subtitle: `Source: ${an.sourceType} • ${an.resolution}`,
      mediaUrl: an.videoUrl || an.sourceImageUrl,
      approval: (an.approval as ApprovalStatus) || "PENDING",
      createdAt: an.createdAt,
      brandId,
    });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    items,
    counts: {
      pending: items.filter((i) => i.approval === "PENDING").length,
      approved: items.filter((i) => i.approval === "APPROVED").length,
      rejected: items.filter((i) => i.approval === "REJECTED").length,
      total: items.length,
    },
  };
}
