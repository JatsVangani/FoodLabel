import { NextRequest, NextResponse } from "next/server";
import { analyzeText, analyzeImage } from "@/lib/gemini";
import type { HealthProfile } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, content, imageBase64, mimeType, profile } = body;

    const healthProfile: HealthProfile[] = Array.isArray(profile) ? profile : [];

    if (mode === "image") {
      if (!imageBase64) {
        return NextResponse.json(
          { error: "imageBase64 is required for image mode" },
          { status: 400 }
        );
      }
      const result = await analyzeImage(
        imageBase64,
        mimeType || "image/jpeg",
        healthProfile
      );
      return NextResponse.json(result);
    }

    if (mode === "text") {
      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: "content is required for text mode" },
          { status: 400 }
        );
      }
      const result = await analyzeText(content, healthProfile);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid mode. Use 'text' or 'image'" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
