import { NextRequest, NextResponse } from "next/server";
import { suggestAlternatives, type Verdict } from "@/lib/gemini";
import type { HealthProfile } from "@/lib/prompts";
import { VALID_HEALTH_PROFILES } from "@/lib/constants";

const VALID_VERDICTS: Verdict[] = ["good", "okay", "avoid"];

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

    if (!VALID_VERDICTS.includes(verdict)) {
      return NextResponse.json(
        { error: "verdict must be one of: good, okay, avoid" },
        { status: 400 }
      );
    }

    const healthProfile: HealthProfile[] = Array.isArray(profile)
      ? profile.filter((p: string): p is HealthProfile =>
          VALID_HEALTH_PROFILES.includes(p as HealthProfile)
        )
      : [];
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
