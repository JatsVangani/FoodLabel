import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VerdictCard from "@/components/VerdictCard";

describe("VerdictCard", () => {
  it("renders 'Good Choice' for good verdict", () => {
    render(
      <VerdictCard
        verdict="good"
        reason="Low sugar and sodium."
        flags={[]}
              />
    );
    expect(screen.getByText("Good Choice")).toBeDefined();
    expect(screen.getByText("Low sugar and sodium.")).toBeDefined();
    expect(screen.getByText("✅")).toBeDefined();
  });

  it("renders 'Okay in Moderation' for okay verdict", () => {
    render(
      <VerdictCard
        verdict="okay"
        reason="Moderate sodium content."
        flags={["high_sodium"]}
              />
    );
    expect(screen.getByText("Okay in Moderation")).toBeDefined();
    expect(screen.getByText("⚠️")).toBeDefined();
  });

  it("renders 'Avoid' for avoid verdict", () => {
    render(
      <VerdictCard
        verdict="avoid"
        reason="Very high sugar."
        flags={["high_sugar"]}
      />
    );
    expect(screen.getByText("Avoid")).toBeDefined();
    expect(screen.getByText("🚫")).toBeDefined();
  });

  it("renders detected concern flags with human-readable labels", () => {
    render(
      <VerdictCard
        verdict="avoid"
        reason="Multiple issues."
        flags={["high_sugar", "high_sodium", "allergen_nuts"]}
      />
    );
    expect(screen.getByText("High Sugar")).toBeDefined();
    expect(screen.getByText("High Sodium")).toBeDefined();
    expect(screen.getByText("Contains Nuts")).toBeDefined();
    expect(screen.getByText("Detected Concerns")).toBeDefined();
  });

  it("does not render concerns section when flags are empty", () => {
    render(
      <VerdictCard verdict="good" reason="All clear." flags={[]} />
    );
    expect(screen.queryByText("Detected Concerns")).toBeNull();
  });

  it("renders unknown flags as-is (fallback)", () => {
    render(
      <VerdictCard
        verdict="okay"
        reason="Some concern."
        flags={["unknown_flag"]}
              />
    );
    expect(screen.getByText("unknown_flag")).toBeDefined();
  });

  it("has correct accessibility role and label", () => {
    render(
      <VerdictCard verdict="good" reason="Fine." flags={[]} />
    );
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "Health verdict result");
  });
});
