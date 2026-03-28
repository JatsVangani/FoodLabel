import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the gemini module
vi.mock("@/lib/gemini", () => ({
  analyzeText: vi.fn(),
  analyzeImage: vi.fn(),
}));

import { analyzeText, analyzeImage } from "@/lib/gemini";
const mockAnalyzeText = vi.mocked(analyzeText);
const mockAnalyzeImage = vi.mocked(analyzeImage);

// Helper to create a NextRequest-like object
function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns analysis result for text mode", async () => {
    mockAnalyzeText.mockResolvedValueOnce({
      verdict: "good",
      reason: "Healthy ingredients.",
      flags: [],
    });

    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({
      mode: "text",
      content: "Ingredients: Oats, Water",
      profile: ["diabetes"],
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.verdict).toBe("good");
    expect(mockAnalyzeText).toHaveBeenCalledWith("Ingredients: Oats, Water", [
      "diabetes",
    ]);
  });

  it("returns analysis result for image mode", async () => {
    mockAnalyzeImage.mockResolvedValueOnce({
      verdict: "avoid",
      reason: "Too much sugar.",
      flags: ["high_sugar"],
    });

    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({
      mode: "image",
      imageBase64: "data:image/jpeg;base64,abc123",
      mimeType: "image/jpeg",
      profile: [],
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.verdict).toBe("avoid");
    expect(mockAnalyzeImage).toHaveBeenCalledWith(
      "data:image/jpeg;base64,abc123",
      "image/jpeg",
      []
    );
  });

  it("returns 400 when image mode lacks imageBase64", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({ mode: "image" });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("imageBase64 is required");
  });

  it("returns 400 when text mode has empty content", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({ mode: "text", content: "   " });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("content is required");
  });

  it("returns 400 when text mode has no content", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({ mode: "text" });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("content is required");
  });

  it("returns 400 for invalid mode", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({ mode: "audio" });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid mode");
  });

  it("returns 500 when analyzeText throws", async () => {
    mockAnalyzeText.mockRejectedValueOnce(new Error("API failure"));

    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({
      mode: "text",
      content: "Ingredients: test",
      profile: [],
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("API failure");
  });

  it("defaults mimeType to image/jpeg when not provided", async () => {
    mockAnalyzeImage.mockResolvedValueOnce({
      verdict: "good",
      reason: "Fine.",
      flags: [],
    });

    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({
      mode: "image",
      imageBase64: "abc123",
      profile: [],
    });

    await POST(req as never);

    expect(mockAnalyzeImage).toHaveBeenCalledWith(
      "abc123",
      "image/jpeg",
      []
    );
  });

  it("defaults profile to empty array when not provided", async () => {
    mockAnalyzeText.mockResolvedValueOnce({
      verdict: "good",
      reason: "Fine.",
      flags: [],
    });

    const { POST } = await import("@/app/api/analyze/route");
    const req = createRequest({ mode: "text", content: "test" });

    await POST(req as never);

    expect(mockAnalyzeText).toHaveBeenCalledWith("test", []);
  });
});
