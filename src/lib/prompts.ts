export type HealthProfile =
  | "diabetes"
  | "hypertension"
  | "nut_allergy"
  | "gluten_intolerance"
  | "dairy_allergy";

export const PROFILE_LABELS: Record<HealthProfile, string> = {
  diabetes: "🩸 Diabetes",
  hypertension: "💓 Hypertension",
  nut_allergy: "🥜 Nut Allergy",
  gluten_intolerance: "🌾 Gluten Intolerance",
  dairy_allergy: "🥛 Dairy Allergy",
};

export const FLAG_LABELS: Record<string, string> = {
  high_sugar: "High Sugar",
  high_sodium: "High Sodium",
  high_saturated_fat: "High Saturated Fat",
  refined_carbs: "Refined Carbs",
  artificial_additives: "Artificial Additives",
  allergen_nuts: "Contains Nuts",
  allergen_gluten: "Contains Gluten",
  allergen_dairy: "Contains Dairy",
};

export const SYSTEM_PROMPT = `You are a clinical nutritionist AI specializing in food safety assessment.
Analyze food label data and return a health verdict strictly as valid JSON with no additional text or markdown.

Rules:
- Output ONLY valid JSON, absolutely no text outside the JSON object
- verdict must be exactly one of: "good", "okay", "avoid"
- reason must be one concise sentence in plain English, max 20 words
- flags must be an array (can be empty) containing only values from this list:
  [high_sugar, high_sodium, high_saturated_fat, refined_carbs, artificial_additives, allergen_nuts, allergen_gluten, allergen_dairy]

Response format:
{"verdict":"good|okay|avoid","reason":"One sentence reason.","flags":["flag1","flag2"]}`;

export const SUGGEST_SYSTEM_PROMPT = `You are a clinical nutritionist AI that recommends healthier food alternatives.
Given a food product that was analyzed, suggest 3 specific healthier alternatives that address the detected concerns.
Tailor suggestions to the user's health profile. Be practical — suggest real, commonly available products or foods.
Output ONLY valid JSON with no additional text or markdown.`;

function formatProfile(profile: HealthProfile[]): string {
  return profile.length > 0
    ? profile.map((p) => PROFILE_LABELS[p]).join(", ")
    : "General population (no specific conditions)";
}

export function buildUserPrompt(
  content: string,
  profile: HealthProfile[]
): string {
  return `User Health Profile: ${formatProfile(profile)}

Food Label Data:
${content}

Analyze this food label for the given health profile and respond with JSON only.`;
}

export function buildSuggestPrompt(
  originalLabel: string,
  verdict: string,
  flags: string[],
  profile: HealthProfile[]
): string {
  const flagStr = flags.length > 0
    ? flags.map((f) => FLAG_LABELS[f] ?? f).join(", ")
    : "none";

  return `User Health Profile: ${formatProfile(profile)}

Original Food Label:
${originalLabel}

Analysis Verdict: ${verdict}
Detected Concerns: ${flagStr}

Suggest 3 healthier alternatives to this food and one actionable nutrition tip. Respond with JSON only.`;
}
