import { NextRequest, NextResponse } from "next/server";
import { suggestAlternatives, type Verdict } from "@/lib/gemini";
import type { HealthProfile } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalLabel, verdict, flags, profile } = body;

    if (!originalLabel || !verdict) {
      return NextResponse.json(
        { error: "originalLabel and verdict are required" },
        { status: 400 }
      );
    }

    const healthProfile: HealthProfile[] = Array.isArray(profile) ? profile : [];
    const healthFlags: string[] = Array.isArray(flags) ? flags : [];

    const result = await suggestAlternatives(
      originalLabel,
      verdict as Verdict,
      healthFlags,
      healthProfile
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Suggestion error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
