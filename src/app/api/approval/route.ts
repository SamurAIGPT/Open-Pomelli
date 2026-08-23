import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setItemApproval, type ApprovalStatus, type CreativesType } from "@/lib/approvals";

const Body = z.object({
  type: z.enum(["asset", "photoshoot", "animation"]),
  id: z.string().min(1),
  approval: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const updated = await setItemApproval(
      parsed.data.type as CreativesType,
      parsed.data.id,
      parsed.data.approval as ApprovalStatus
    );
    return NextResponse.json({ item: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
