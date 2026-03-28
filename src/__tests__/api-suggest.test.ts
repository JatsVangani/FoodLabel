import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/gemini", () => ({
  analyzeText: vi.fn(),
  analyzeImage: vi.fn(),
  suggestAlternatives: vi.fn(),
}));

import { suggestAlternatives } from "@/lib/gemini";
const mockSuggest = vi.mocked(suggestAlternatives);

function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/suggest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns suggestions for valid input", async () => {
    mockSuggest.mockResolvedValueOnce({
      alternatives: [
        { name: "Greek Yogurt", why: "Lower sugar, high protein" },
        { name: "Fresh Fruit", why: "Natural sugars with fiber" },
        { name: "Oatmeal", why: "Complex carbs, low sodium" },
      ],
      tip: "Check the serving size before comparing nutrition labels.",
    });

    const { POST } = await import("@/app/api/suggest/route");
    const req = createRequest({
      originalLabel: "Ingredients: Sugar, Salt",
      verdict: "avoid",
      flags: ["high_sugar"],
      profile: ["diabetes"],
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.alternatives).toHaveLength(3);
    expect(json.tip).toBeTruthy();
    expect(mockSuggest).toHaveBeenCalledWith(
      "Ingredients: Sugar, Salt",
      "avoid",
      ["high_sugar"],
      ["diabetes"]
    );
  });

  it("returns 400 when originalLabel is missing", async () => {
    const { POST } = await import("@/app/api/suggest/route");
    const req = createRequest({ verdict: "avoid" });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("originalLabel and verdict are required");
  });

  it("returns 400 when verdict is missing", async () => {
    const { POST } = await import("@/app/api/suggest/route");
    const req = createRequest({ originalLabel: "test" });

    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 500 when suggestAlternatives throws", async () => {
    mockSuggest.mockRejectedValueOnce(new Error("Gemini error"));

    const { POST } = await import("@/app/api/suggest/route");
    const req = createRequest({
      originalLabel: "test",
      verdict: "okay",
      flags: [],
      profile: [],
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Gemini error");
  });

  it("defaults profile and flags to empty arrays", async () => {
    mockSuggest.mockResolvedValueOnce({
      alternatives: [],
      tip: "Eat more vegetables.",
    });

    const { POST } = await import("@/app/api/suggest/route");
    const req = createRequest({
      originalLabel: "test",
      verdict: "good",
    });

    await POST(req as never);

    expect(mockSuggest).toHaveBeenCalledWith("test", "good", [], []);
  });
});
