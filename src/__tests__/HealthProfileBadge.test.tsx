import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthProfileBadge from "@/components/HealthProfileBadge";

describe("HealthProfileBadge", () => {
  it("renders nothing when profile is empty", () => {
    const { container } = render(<HealthProfileBadge profile={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders badges for each selected condition", () => {
    render(<HealthProfileBadge profile={["diabetes", "hypertension"]} />);
    expect(screen.getByText("🩸 Diabetes")).toBeDefined();
    expect(screen.getByText("💓 Hypertension")).toBeDefined();
  });

  it("renders all five conditions when fully selected", () => {
    render(
      <HealthProfileBadge
        profile={[
          "diabetes",
          "hypertension",
          "nut_allergy",
          "gluten_intolerance",
          "dairy_allergy",
        ]}
      />
    );
    const badges = screen.getAllByText(/.+/);
    expect(badges.length).toBe(5);
  });

  it("renders a single condition", () => {
    render(<HealthProfileBadge profile={["nut_allergy"]} />);
    expect(screen.getByText("🥜 Nut Allergy")).toBeDefined();
  });
});
