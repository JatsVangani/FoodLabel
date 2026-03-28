import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent };
      }
    },
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: "HARM_CATEGORY_HARASSMENT",
      HARM_CATEGORY_HATE_SPEECH: "HARM_CATEGORY_HATE_SPEECH",
      HARM_CATEGORY_SEXUALLY_EXPLICIT: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      HARM_CATEGORY_DANGEROUS_CONTENT: "HARM_CATEGORY_DANGEROUS_CONTENT",
    },
    HarmBlockThreshold: {
      BLOCK_NONE: "BLOCK_NONE",
    },
    SchemaType: {
      OBJECT: "OBJECT",
      STRING: "STRING",
      ARRAY: "ARRAY",
    },
  };
});

describe("gemini module", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
    vi.resetModules();
    mockGenerateContent.mockReset();
  });

  describe("analyzeText", () => {
    it("returns parsed analysis for a valid response", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              verdict: "avoid",
              reason: "High sugar content is harmful for diabetics.",
              flags: ["high_sugar"],
            }),
        },
      });

      const { analyzeText } = await import("@/lib/gemini");
      const result = await analyzeText("Ingredients: Sugar, Corn Syrup", [
        "diabetes",
      ]);

      expect(result.verdict).toBe("avoid");
      expect(result.reason).toContain("sugar");
      expect(result.flags).toContain("high_sugar");
    });

    it("handles response wrapped in markdown code fences", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            '```json\n{"verdict":"good","reason":"Healthy choice.","flags":[]}\n```',
        },
      });

      const { analyzeText } = await import("@/lib/gemini");
      const result = await analyzeText("Ingredients: Oats, Water", []);

      expect(result.verdict).toBe("good");
      expect(result.flags).toEqual([]);
    });

    it("throws on invalid verdict value", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              verdict: "maybe",
              reason: "Not sure.",
              flags: [],
            }),
        },
      });

      const { analyzeText } = await import("@/lib/gemini");
      await expect(analyzeText("Ingredients: Mystery", [])).rejects.toThrow(
        "Invalid verdict value"
      );
    });

    it("defaults reason when missing", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({ verdict: "okay", flags: [] }),
        },
      });

      const { analyzeText } = await import("@/lib/gemini");
      const result = await analyzeText("test", []);

      expect(result.reason).toBe("No reason provided.");
    });

    it("defaults flags to empty array when not an array", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              verdict: "good",
              reason: "Fine.",
              flags: "not-an-array",
            }),
        },
      });

      const { analyzeText } = await import("@/lib/gemini");
      const result = await analyzeText("test", []);

      expect(result.flags).toEqual([]);
    });
  });

  describe("analyzeImage", () => {
    it("returns parsed result for image analysis", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              verdict: "okay",
              reason: "Moderate sodium.",
              flags: ["high_sodium"],
            }),
        },
      });

      const { analyzeImage } = await import("@/lib/gemini");
      const result = await analyzeImage(
        "data:image/jpeg;base64,/9j/4AAQ",
        "image/jpeg",
        ["hypertension"]
      );

      expect(result.verdict).toBe("okay");
      expect(result.flags).toContain("high_sodium");
    });

    it("handles raw base64 without data URL prefix", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              verdict: "good",
              reason: "Healthy.",
              flags: [],
            }),
        },
      });

      const { analyzeImage } = await import("@/lib/gemini");
      const result = await analyzeImage("/9j/4AAQ", "image/png", []);

      expect(result.verdict).toBe("good");
    });
  });

  describe("suggestAlternatives", () => {
    it("returns parsed suggestions", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              alternatives: [
                { name: "Greek Yogurt", why: "Lower sugar" },
                { name: "Fresh Fruit", why: "Natural sugars" },
                { name: "Oatmeal", why: "Complex carbs" },
              ],
              tip: "Read the label carefully.",
            }),
        },
      });

      const { suggestAlternatives } = await import("@/lib/gemini");
      const result = await suggestAlternatives(
        "Ingredients: Sugar, Salt",
        "avoid",
        ["high_sugar"],
        ["diabetes"]
      );

      expect(result.alternatives).toHaveLength(3);
      expect(result.alternatives[0].name).toBe("Greek Yogurt");
      expect(result.tip).toContain("label");
    });

    it("limits alternatives to 3 items", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              alternatives: [
                { name: "A", why: "a" },
                { name: "B", why: "b" },
                { name: "C", why: "c" },
                { name: "D", why: "d" },
              ],
              tip: "Tip.",
            }),
        },
      });

      const { suggestAlternatives } = await import("@/lib/gemini");
      const result = await suggestAlternatives("test", "okay", [], []);

      expect(result.alternatives).toHaveLength(3);
    });

    it("defaults empty alternatives gracefully", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              alternatives: null,
              tip: "",
            }),
        },
      });

      const { suggestAlternatives } = await import("@/lib/gemini");
      const result = await suggestAlternatives("test", "good", [], []);

      expect(result.alternatives).toEqual([]);
      expect(result.tip).toBe("");
    });
  });

  describe("getClient", () => {
    it("throws when GEMINI_API_KEY is not set", async () => {
      vi.stubEnv("GEMINI_API_KEY", "");

      const { analyzeText } = await import("@/lib/gemini");

      await expect(analyzeText("test", [])).rejects.toThrow(
        "GEMINI_API_KEY is not set"
      );
    });
  });
});
