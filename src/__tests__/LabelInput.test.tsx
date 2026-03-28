import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LabelInput from "@/components/LabelInput";

describe("LabelInput", () => {
  it("renders with text tab active by default", () => {
    render(<LabelInput onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByPlaceholderText(/paste ingredients/i)).toBeDefined();
  });

  it("switches to image tab on click", async () => {
    render(<LabelInput onSubmit={vi.fn()} loading={false} />);
    await userEvent.click(screen.getByText(/scan label image/i));
    expect(screen.getByText(/drop image here/i)).toBeDefined();
  });

  it("disables analyze button when text is empty", () => {
    render(<LabelInput onSubmit={vi.fn()} loading={false} />);
    const button = screen.getByRole("button", { name: /analyze label/i });
    expect(button).toBeDisabled();
  });

  it("enables analyze button when text is entered", async () => {
    render(<LabelInput onSubmit={vi.fn()} loading={false} />);
    await userEvent.type(
      screen.getByPlaceholderText(/paste ingredients/i),
      "Ingredients: Sugar"
    );
    const button = screen.getByRole("button", { name: /analyze label/i });
    expect(button).not.toBeDisabled();
  });

  it("calls onSubmit with text mode data", async () => {
    const onSubmit = vi.fn();
    render(<LabelInput onSubmit={onSubmit} loading={false} />);
    await userEvent.type(
      screen.getByPlaceholderText(/paste ingredients/i),
      "Ingredients: Oats"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /analyze label/i })
    );
    expect(onSubmit).toHaveBeenCalledWith("text", "Ingredients: Oats");
  });

  it("shows 'Analyzing...' on button when loading", () => {
    render(<LabelInput onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
  });

  it("disables textarea when loading", () => {
    render(<LabelInput onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByPlaceholderText(/paste ingredients/i)).toBeDisabled();
  });

  it("does not call onSubmit when text is empty and button clicked", () => {
    const onSubmit = vi.fn();
    render(<LabelInput onSubmit={onSubmit} loading={false} />);
    fireEvent.click(screen.getByRole("button", { name: /analyze label/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders both tab buttons", () => {
    render(<LabelInput onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByText(/paste label text/i)).toBeDefined();
    expect(screen.getByText(/scan label image/i)).toBeDefined();
  });
});
