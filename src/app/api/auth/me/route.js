import { NextResponse } from "next/server";
import { DBService } from "@/lib/db";

export async function GET(req) {
  try {
    const email = req.cookies.get("revid_user_email")?.value;

    if (!email) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await DBService.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name || "Creator",
        email: user.email,
        image: user.image || null,
        credits: user.credits ?? 0,
      },
    });
  } catch (err) {
    if (err?.digest?.includes?.("PRERENDER")) {
      throw err;
    }
    console.error("[AUTH/ME] Error:", err);
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 500 }
    );
  }
}
