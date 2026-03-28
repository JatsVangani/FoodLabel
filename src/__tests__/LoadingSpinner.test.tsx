import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@/components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with status role for accessibility", () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(status).toHaveAttribute("aria-label", "Analyzing food label");
  });

  it("displays the analyzing message", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/analyzing your food label/i)).toBeDefined();
  });

  it("displays the Gemini AI subtext", () => {
    render(<LoadingSpinner />);
    expect(
      screen.getByText(/gemini ai is reviewing/i)
    ).toBeDefined();
  });
});
