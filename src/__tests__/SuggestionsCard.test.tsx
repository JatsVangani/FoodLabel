import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SuggestionsCard from "@/components/SuggestionsCard";

describe("SuggestionsCard", () => {
  const mockAlternatives = [
    { name: "Greek Yogurt", why: "Lower sugar, high protein" },
    { name: "Fresh Fruit", why: "Natural sugars with fiber" },
    { name: "Oatmeal", why: "Complex carbs, low sodium" },
  ];

  it("renders the heading", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Eat well." />);
    expect(screen.getByText("Healthier Alternatives")).toBeDefined();
  });

  it("renders all three alternatives", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Eat well." />);
    expect(screen.getByText("Greek Yogurt")).toBeDefined();
    expect(screen.getByText("Fresh Fruit")).toBeDefined();
    expect(screen.getByText("Oatmeal")).toBeDefined();
  });

  it("renders the reason for each alternative", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Eat well." />);
    expect(screen.getByText("Lower sugar, high protein")).toBeDefined();
    expect(screen.getByText("Natural sugars with fiber")).toBeDefined();
  });

  it("renders the nutrition tip", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Check serving sizes." />);
    expect(screen.getByText("Nutrition Tip")).toBeDefined();
    expect(screen.getByText("Check serving sizes.")).toBeDefined();
  });

  it("does not render tip section when tip is empty", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="" />);
    expect(screen.queryByText("Nutrition Tip")).toBeNull();
  });

  it("has correct accessibility role and label", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Tip." />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "Healthier alternatives");
  });

  it("renders medal emojis for ranking", () => {
    render(<SuggestionsCard alternatives={mockAlternatives} tip="Tip." />);
    expect(screen.getByText("🥇")).toBeDefined();
    expect(screen.getByText("🥈")).toBeDefined();
    expect(screen.getByText("🥉")).toBeDefined();
  });
});
