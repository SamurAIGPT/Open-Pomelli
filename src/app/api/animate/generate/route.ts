import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateAnimation } from "@/lib/animate";
import { requireApprovedSourceImage, GatePreconditionError } from "@/lib/approvals";
import { logActivity } from "@/lib/activity";

const Body = z.object({
  sourceImageUrl: z.string().url(),
  sourceType: z.enum(["asset", "photoshoot", "upload"]),
  sourceId: z.string().nullable().optional(),
  prompt: z.string().min(1).max(2000),
  duration: z.number().int().min(3).max(12).optional(),
  resolution: z.enum(["480p", "720p", "1080p"]).optional(),
  brandId: z.string().nullable().optional(),
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  // Precondition Gate Check: Image must be APPROVED
  try {
    await requireApprovedSourceImage(
      parsed.data.sourceType,
      parsed.data.sourceId,
      parsed.data.sourceImageUrl
    );
  } catch (gateErr) {
    if (gateErr instanceof GatePreconditionError) {
      await logActivity({
        brandId: parsed.data.brandId,
        actor: "gate-keeper",
        action: "gate_blocked",
        category: "governance",
        detail: `Precondition Gate: Blocked video generation. Source ${gateErr.sourceType} (${gateErr.sourceId || "image"}) is not APPROVED (${gateErr.currentApproval}).`,
        metadata: {
          sourceType: gateErr.sourceType,
          sourceId: gateErr.sourceId,
          currentApproval: gateErr.currentApproval,
        },
      });

      return NextResponse.json(
        {
          error: "GATE_PRECONDITION_FAILED",
          message: gateErr.message,
          sourceType: gateErr.sourceType,
          sourceId: gateErr.sourceId,
          currentApproval: gateErr.currentApproval,
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: String(gateErr) }, { status: 400 });
  }

  const row = await prisma.animation.create({
    data: {
      sourceImageUrl: parsed.data.sourceImageUrl,
      sourceType: parsed.data.sourceType,
      sourceId: parsed.data.sourceId ?? null,
      prompt: parsed.data.prompt,
      duration: parsed.data.duration ?? 5,
      resolution: parsed.data.resolution ?? "720p",
      brandId: parsed.data.brandId ?? null,
      approval: "PENDING",
    },
  });

  try {
    const videoUrl = await generateAnimation(parsed.data.sourceImageUrl, parsed.data.prompt, {
      duration: parsed.data.duration,
      resolution: parsed.data.resolution,
    });
    if (!videoUrl) {
      await prisma.animation.delete({ where: { id: row.id } });
      return NextResponse.json({ error: "video generation returned no url" }, { status: 502 });
    }
    const updated = await prisma.animation.update({
      where: { id: row.id },
      data: { videoUrl },
    });

    await logActivity({
      brandId: parsed.data.brandId,
      actor: "ai-agent",
      action: "generate_animation",
      category: "generation",
      detail: `Generated animated video (${updated.duration}s, ${updated.resolution}) via seedance-lite-i2v`,
      metadata: {
        animationId: updated.id,
        videoUrl: updated.videoUrl,
        prompt: updated.prompt,
        duration: updated.duration,
        resolution: updated.resolution,
        sourceType: updated.sourceType,
      },
    });

    return NextResponse.json({
      id: updated.id,
      videoUrl: updated.videoUrl,
      sourceImageUrl: updated.sourceImageUrl,
      duration: updated.duration,
      resolution: updated.resolution,
      sourceType: updated.sourceType,
      prompt: updated.prompt,
    });
  } catch (e) {
    await prisma.animation.delete({ where: { id: row.id } }).catch(() => {});
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
