import { describe, it, expect } from "vitest";
import {
  PROFILE_LABELS,
  FLAG_LABELS,
  SYSTEM_PROMPT,
  buildUserPrompt,
  type HealthProfile,
} from "@/lib/prompts";

describe("PROFILE_LABELS", () => {
  it("contains all five health conditions", () => {
    const keys = Object.keys(PROFILE_LABELS);
    expect(keys).toHaveLength(5);
    expect(keys).toContain("diabetes");
    expect(keys).toContain("hypertension");
    expect(keys).toContain("nut_allergy");
    expect(keys).toContain("gluten_intolerance");
    expect(keys).toContain("dairy_allergy");
  });

  it("each label includes an emoji", () => {
    for (const label of Object.values(PROFILE_LABELS)) {
      // Emoji characters are outside basic ASCII range
      expect(label).not.toMatch(/^[a-zA-Z\s]+$/);
    }
  });
});

describe("FLAG_LABELS", () => {
  it("contains all expected flag keys", () => {
    const expectedFlags = [
      "high_sugar",
      "high_sodium",
      "high_saturated_fat",
      "refined_carbs",
      "artificial_additives",
      "allergen_nuts",
      "allergen_gluten",
      "allergen_dairy",
    ];
    for (const flag of expectedFlags) {
      expect(FLAG_LABELS).toHaveProperty(flag);
    }
  });

  it("maps flags to human-readable strings", () => {
    expect(FLAG_LABELS.high_sugar).toBe("High Sugar");
    expect(FLAG_LABELS.allergen_nuts).toBe("Contains Nuts");
    expect(FLAG_LABELS.allergen_dairy).toBe("Contains Dairy");
  });
});

describe("SYSTEM_PROMPT", () => {
  it("instructs the model to return JSON", () => {
    expect(SYSTEM_PROMPT).toContain("JSON");
  });

  it("specifies the three verdict values", () => {
    expect(SYSTEM_PROMPT).toContain("good");
    expect(SYSTEM_PROMPT).toContain("okay");
    expect(SYSTEM_PROMPT).toContain("avoid");
  });

  it("mentions the response format fields", () => {
    expect(SYSTEM_PROMPT).toContain("verdict");
    expect(SYSTEM_PROMPT).toContain("reason");
    expect(SYSTEM_PROMPT).toContain("flags");
  });
});

describe("buildUserPrompt", () => {
  it("includes health profile labels when profile is provided", () => {
    const profile: HealthProfile[] = ["diabetes", "nut_allergy"];
    const result = buildUserPrompt("Ingredients: Sugar, Salt", profile);

    expect(result).toContain(PROFILE_LABELS.diabetes);
    expect(result).toContain(PROFILE_LABELS.nut_allergy);
  });

  it("uses general population text when no profile given", () => {
    const result = buildUserPrompt("Ingredients: Oats", []);
    expect(result).toContain("General population (no specific conditions)");
  });

  it("includes the food label content", () => {
    const content = "Ingredients: Whole Wheat, Sugar, Palm Oil";
    const result = buildUserPrompt(content, []);
    expect(result).toContain(content);
  });

  it("ends with instruction to respond in JSON", () => {
    const result = buildUserPrompt("test", []);
    expect(result).toContain("respond with JSON only");
  });

  it("includes all selected conditions separated by commas", () => {
    const profile: HealthProfile[] = [
      "diabetes",
      "hypertension",
      "dairy_allergy",
    ];
    const result = buildUserPrompt("test", profile);
    expect(result).toContain(PROFILE_LABELS.diabetes);
    expect(result).toContain(PROFILE_LABELS.hypertension);
    expect(result).toContain(PROFILE_LABELS.dairy_allergy);
  });
});
