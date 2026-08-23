import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createProduct, getProductsByBrand } from "@/lib/products";
import { logActivity } from "@/lib/activity";

const CreateBody = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().min(1).max(3000),
  price: z.number().nonnegative(),
  currency: z.string().min(1).max(10).default("USD"),
  category: z.string().max(100).optional().nullable(),
  images: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  claims: z.array(z.string()).default([]),
  fidelityLock: z.boolean().default(true),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  try {
    const products = await getProductsByBrand(brandId);
    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  const brand = await prisma.brandDNA.findUnique({ where: { id: brandId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const product = await createProduct({
      brandId,
      ...parsed.data,
    });

    await logActivity({
      brandId,
      actor: "user",
      action: "create_product",
      category: "brand",
      detail: `Added product "${product.name}" with ${product.claims.length} verified claims and ${product.images.length} reference photos`,
      metadata: {
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        claimsCount: product.claims.length,
        fidelityLock: product.fidelityLock,
      },
    });

    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
