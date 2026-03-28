import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
  type GenerationConfig,
  type SafetySetting,
} from "@google/generative-ai";
import { SYSTEM_PROMPT, SUGGEST_SYSTEM_PROMPT, buildUserPrompt, buildSuggestPrompt, type HealthProfile } from "./prompts";

export type Verdict = "good" | "okay" | "avoid";

export interface AnalysisResult {
  verdict: Verdict;
  reason: string;
  flags: string[];
}

export interface Suggestion {
  name: string;
  why: string;
}

export interface SuggestResult {
  alternatives: Suggestion[];
  tip: string;
}

/* ── Safety: block nothing so food-related content is never filtered ── */
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/* ── Generation config: low temperature for consistent, deterministic results ── */
const analysisGenerationConfig: GenerationConfig = {
  temperature: 0.2,
  topK: 40,
  topP: 0.8,
  maxOutputTokens: 256,
  responseMimeType: "application/json",
  responseSchema: {
    type: SchemaType.OBJECT,
    properties: {
      verdict: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["good", "okay", "avoid"],
        description: "Health verdict for the food",
      },
      reason: {
        type: SchemaType.STRING,
        description: "One concise sentence explaining the verdict, max 20 words",
      },
      flags: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          format: "enum",
          enum: [
            "high_sugar",
            "high_sodium",
            "high_saturated_fat",
            "refined_carbs",
            "artificial_additives",
            "allergen_nuts",
            "allergen_gluten",
            "allergen_dairy",
          ],
        },
        description: "Array of detected health concern flags",
      },
    },
    required: ["verdict", "reason", "flags"],
  },
};

const suggestGenerationConfig: GenerationConfig = {
  temperature: 0.6,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 512,
  responseMimeType: "application/json",
  responseSchema: {
    type: SchemaType.OBJECT,
    properties: {
      alternatives: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Name of the healthier alternative product or food",
            },
            why: {
              type: SchemaType.STRING,
              description: "Brief reason why this is a better choice, max 15 words",
            },
          },
          required: ["name", "why"],
        },
        description: "List of 3 healthier alternative foods",
      },
      tip: {
        type: SchemaType.STRING,
        description: "One actionable nutrition tip for the user, max 25 words",
      },
    },
    required: ["alternatives", "tip"],
  },
};

/* ── Client singleton ── */
let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

/* ── Extract text from response, handling thinking models ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(response: any): string {
  // For thinking models, iterate parts and skip thought parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts && Array.isArray(parts)) {
    // Find the last non-thought text part (the actual model output)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (part.thought) continue;
      if (part.text) return part.text;
    }
  }
  // Fallback to .text()
  const direct = response.text();
  if (direct) return direct;
  throw new Error("Empty response from Gemini");
}

/* ── Parse helpers ── */
function parseAnalysis(raw: string): AnalysisResult {
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

function parseSuggestions(raw: string): SuggestResult {
  const cleaned = raw.trim().replace(/^```json\n?|```$/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    alternatives: Array.isArray(parsed.alternatives)
      ? parsed.alternatives.slice(0, 3).map((a: { name?: string; why?: string }) => ({
          name: String(a.name || "Unknown"),
          why: String(a.why || ""),
        }))
      : [],
    tip: String(parsed.tip || ""),
  };
}

/* ── Analysis endpoints ── */
export async function analyzeText(
  content: string,
  profile: HealthProfile[]
): Promise<AnalysisResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    safetySettings,
    generationConfig: analysisGenerationConfig,
  });

  const result = await model.generateContent(buildUserPrompt(content, profile));
  const text = extractText(result.response);
  return parseAnalysis(text);
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  profile: HealthProfile[]
): Promise<AnalysisResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    safetySettings,
    generationConfig: analysisGenerationConfig,
  });

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

  const text = extractText(result.response);
  return parseAnalysis(text);
}

/* ── Suggestion endpoint: healthier alternatives via Gemini ── */
export async function suggestAlternatives(
  originalLabel: string,
  verdict: Verdict,
  flags: string[],
  profile: HealthProfile[]
): Promise<SuggestResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SUGGEST_SYSTEM_PROMPT,
    safetySettings,
    generationConfig: suggestGenerationConfig,
  });

  const prompt = buildSuggestPrompt(originalLabel, verdict, flags, profile);
  const result = await model.generateContent(prompt);
  const text = extractText(result.response);
  return parseSuggestions(text);
}
