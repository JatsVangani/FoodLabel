/** Shared constants to eliminate magic strings across the codebase */

export const STORAGE_KEY_PROFILE = "health_profile";
export const GEMINI_MODEL = "gemini-2.5-flash-lite";
export const VALID_HEALTH_PROFILES = [
  "diabetes",
  "hypertension",
  "nut_allergy",
  "gluten_intolerance",
  "dairy_allergy",
] as const;
