import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { SYSTEM_PROMPT, buildUserPrompt, type HealthProfile } from "./prompts";

export type Verdict = "good" | "okay" | "avoid";

export interface AnalysisResult {
  verdict: Verdict;
  reason: string;
  flags: string[];
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

function parseResult(raw: string): AnalysisResult {
  // Strip any markdown code fences or extra whitespace
  const cleaned = raw.trim().replace(/^```json\n?|```$/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const verdict = parsed.verdict;
  if (!["good", "okay", "avoid"].includes(verdict)) {
    throw new Error("Invalid verdict value");
  }

  return {
    verdict: verdict as Verdict,
    reason: String(parsed.reason || "No reason provided."),
    flags: Array.isArray(parsed.flags) ? parsed.flags : [],
  };
}

export async function analyzeText(
  content: string,
  profile: HealthProfile[]
): Promise<AnalysisResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    safetySettings,
  });

  const result = await model.generateContent(buildUserPrompt(content, profile));
  const text = result.response.text();
  return parseResult(text);
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  profile: HealthProfile[]
): Promise<AnalysisResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
    safetySettings,
  });

  // Strip the data URL prefix if present
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
    buildUserPrompt(
      "Analyze the food label shown in this image. Extract all visible ingredient and nutrition information.",
      profile
    ),
  ]);

  const text = result.response.text();
  return parseResult(text);
}
