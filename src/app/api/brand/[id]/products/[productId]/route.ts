import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProductById, updateProduct, deleteProduct } from "@/lib/products";
import { logActivity } from "@/lib/activity";

const PatchBody = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().min(1).max(3000).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().min(1).max(10).optional(),
  category: z.string().max(100).optional().nullable(),
  images: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  claims: z.array(z.string()).optional(),
  fidelityLock: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id: brandId, productId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await getProductById(productId);
  if (!existing || existing.brandId !== brandId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const updated = await updateProduct(productId, parsed.data);

    await logActivity({
      brandId,
      actor: "user",
      action: "update_product",
      category: "brand",
      detail: `Updated product "${updated.name}" facts and verified claims`,
      metadata: {
        productId: updated.id,
        name: updated.name,
        claimsCount: updated.claims.length,
        fidelityLock: updated.fidelityLock,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id: brandId, productId } = await params;
  const existing = await getProductById(productId);
  if (!existing || existing.brandId !== brandId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await deleteProduct(productId);
    await logActivity({
      brandId,
      actor: "user",
      action: "delete_product",
      category: "brand",
      detail: `Deleted product "${existing.name}" from catalog`,
      metadata: { productId, name: existing.name },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
